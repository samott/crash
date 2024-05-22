import { useState, useEffect } from 'react';

import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import { SiweMessage } from 'siwe';

import { useGameStore, GameState } from '../store/gameStore';

import erc20Abi from '../abis/erc20.json';

import { currencies, coinContracts } from '../lib/currencies';

export type WalletBalances = Record<string, string>;

export type UseWalletBalanceResult = {
	isLoading: boolean;
	balances: WalletBalances;
}

export type CurrencyContract = {
	currency: string;
	contract: Contract;
};

const contractDecimals = Object.fromEntries(
	currencies.map((currency) => [currency.id, currency.contractDecimals])
);

export default function useWalletBalances() : UseWalletBalanceResult {
	const { address, chainId, isConnected } = useWeb3ModalAccount();
	const { walletProvider } = useWeb3ModalProvider();

	const [balances, setBalances] = useState<WalletBalances>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function loadBalances() : Promise<WalletBalances> {
		const results: WalletBalances = {};

		if (!isConnected || !walletProvider)
			throw new Error('Wallet not connected or no provider');

		const hexChainId = '0x' + chainId?.toString(16);

		if (!(hexChainId in coinContracts))
			throw new Error(`Unsupported chain ID: ${hexChainId}`);

		const provider = new BrowserProvider(walletProvider);
		const signer = await provider.getSigner()

		const contracts: CurrencyContract[] = 
			Object.keys(coinContracts[hexChainId]).map(
				(currency) => ({
					currency,
					contract: new Contract(coinContracts[hexChainId][currency], erc20Abi, provider)
				})
			);

		const getBalance = async (currency: string, contract: Contract): Promise<[string, string]> => {
			const balance = await contract.balanceOf(address);

			const strBalance = formatUnits(
				balance,
				contractDecimals[currency]
			);

			return [
				currency,
				strBalance,
			];
		}

		const data = await Promise.all(
			contracts.map((cc) => getBalance(cc.currency, cc.contract))
		);

		return Object.fromEntries(data);
	}

	useEffect(() => {
		(async () => {
			if (!isConnected)
				return;

			setIsLoading(true);

			try {
				const newBalances = await loadBalances();
				setBalances(newBalances);
			} catch (e) {
				console.error(e);
			}

			setIsLoading(false);
		})();
	}, [isConnected]);

	return {
		balances,
		isLoading
	};
}
