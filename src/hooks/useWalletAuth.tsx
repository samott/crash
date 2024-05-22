import { useState } from 'react';

import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';

import { useGameStore, GameState } from '../store/gameStore';

export type LoginParams = {
	message: string;
	signature: string;
};

export type UseWalletAuthResult = {
	signIn: () => void;
	canSignIn: boolean;
	isSigningIn: boolean;
	isWalletConnected: boolean;
}

export default function useWalletAuth() : UseWalletAuthResult {
	const { chainId, isConnected } = useWeb3ModalAccount();
	const { walletProvider } = useWeb3ModalProvider();
	const { authenticate, getNonce } = useGameStore((gameState: GameState) => gameState.actions);

	const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

	async function acquireSignature(nonce: string) : Promise<LoginParams> {
		if (!isConnected || !walletProvider)
			throw new Error('Wallet not connected or no provider');

		const provider = new BrowserProvider(walletProvider);
		const signer = await provider.getSigner()

		const domain = window.location.host;
		const origin = window.location.origin;

		const siweMessage = new SiweMessage({
			domain,
			address: signer?.address,
			statement: 'Sign in to Crash',
			uri: origin,
			version: '1',
			chainId: chainId,
			nonce,
		});

		const message = siweMessage.prepareMessage();
		const signature = await signer.signMessage(message);

		return {
			message,
			signature
		};
	}

	async function signIn() {
		setIsSigningIn(true);
		try {
			const nonce = await getNonce();
			const { message, signature } = await acquireSignature(nonce);
			authenticate(message, signature);
		} catch (e) {
			console.error(e);
		}

		setIsSigningIn(false);
	}

	const canSignIn = isConnected && !!walletProvider;

	return {
		signIn,
		isSigningIn,
		isWalletConnected: isConnected,
		canSignIn,
	};
}
