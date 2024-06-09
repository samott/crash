import { useState, useEffect } from 'react';

import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
import { SiweMessage } from 'siwe';

import { useGameStore, GameState } from '../store/gameStore';

import erc20Abi from '../abis/erc20.json';
import crashAbi from '../abis/crash.json';

import { currencies, currencyById, coinContracts } from '../lib/currencies';

export type WalletAmounts = Record<string, string>;

export type UseWalletBalanceResult = {
	isLoading: boolean;
	balances: WalletAmounts;
	allowances: WalletAmounts;
	approveToken: (currency: string, amount: string) => void;
	depositToken: (currency: string, amount: string) => void;
}

export type CurrencyContract = {
	currency: string;
	contract: Contract;
};

const contractDecimals = Object.fromEntries(
	currencies.map((currency) => [currency.id, currency.contractDecimals])
);

const crashContract = '0x1111111111111111111111111111111111111111';

const queryContract = async (
	currency: string,
	contract: Contract,
	method: string,
	args: any[]
): Promise<[string, string]> => {
	const balance = await contract[method](...args);

	const strBalance = formatUnits(
		balance,
		contractDecimals[currency]
	);

	return [
		currency,
		strBalance,
	];
}

export default function useWalletBalances() : UseWalletBalanceResult {
	const { address, chainId, isConnected } = useWeb3ModalAccount();
	const { walletProvider } = useWeb3ModalProvider();

	const [balances, setBalances] = useState<WalletAmounts>({});
	const [allowances, setAllowances] = useState<WalletAmounts>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function loadBalances() {
		if (!isConnected || !walletProvider)
			throw new Error('Wallet not connected or no provider');

		const hexChainId = '0x' + chainId?.toString(16);

		if (!(hexChainId in coinContracts))
			throw new Error(`Unsupported chain ID: ${hexChainId}`);

		const provider = new BrowserProvider(walletProvider);

		const contracts: CurrencyContract[] = 
			Object.keys(coinContracts[hexChainId]).map(
				(currency) => ({
					currency,
					contract: new Contract(coinContracts[hexChainId][currency], erc20Abi, provider)
				})
			);

		const balanceData = await Promise.all(
			contracts.map((cc) => queryContract(
				cc.currency,
				cc.contract,
				'balanceOf',
				[ address ]
			))
		);

		const allowanceData = await Promise.all(
			contracts.map((cc) => queryContract(
				cc.currency,
				cc.contract,
				'allowance',
				[ address, crashContract ]
			))
		);

		setBalances(Object.fromEntries(balanceData));
		setAllowances(Object.fromEntries(allowanceData));
	}

	const approveToken = async (
		currency: string,
		amount: string
	) => {
		if (!isConnected || !walletProvider)
			throw new Error('Wallet not connected or no provider');

		const hexChainId = '0x' + chainId?.toString(16);

		if (!(hexChainId in coinContracts))
			throw new Error(`Unsupported chain ID: ${hexChainId}`);

		const provider = new BrowserProvider(walletProvider);
		const signer = await provider.getSigner();

		const contract = new Contract(coinContracts[hexChainId][currency], erc20Abi, signer)

		const amountWei = parseUnits(amount, contractDecimals[currency]);

		const tx = await contract.approve(crashContract, amountWei);
		const receipt = await tx.wait();

		if (receipt)
			setImmediate(loadBalances);
	}

	const depositToken = async (
		currency: string,
		amount: string
	) => {
		if (!isConnected || !walletProvider)
			throw new Error('Wallet not connected or no provider');

		const hexChainId = '0x' + chainId?.toString(16);

		if (!(hexChainId in coinContracts))
			throw new Error(`Unsupported chain ID: ${hexChainId}`);

		const provider = new BrowserProvider(walletProvider);
		const signer = await provider.getSigner();

		const contract = new Contract(crashContract, crashAbi, signer)

		const amountWei = parseUnits(amount, contractDecimals[currency]);

		const { coinId } = currencyById[currency];

		contract.deposit(coinId, amountWei);
	}

	useEffect(() => {
		(async () => {
			if (!isConnected)
				return;

			setIsLoading(true);

			try {
				await loadBalances();
			} catch (e) {
				console.error(e);
			}

			setIsLoading(false);
		})();
	}, [isConnected]);

	return {
		balances,
		allowances,
		approveToken,
		depositToken,
		isLoading
	};
}
