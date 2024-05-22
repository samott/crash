"use client";

import { useState } from 'react';

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { useGameStore, GameState } from '../store/gameStore';
import useWalletAuth from '../hooks/useWalletAuth';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { currencies } from '../lib/currencies';

import CurrencyList from './CurrencyList';

import styles from '../styles/components/GameControls.module.css';

export default function GameControls() {
	const walletAuth = useWalletAuth();

	const [betAmount, setBetAmount] = useState<string>('0');
	const [autoCashOut, setAutoCashOut] = useState<string>('0');
	const [currency, setCurrency] = useState<string>(currencies[0].id);

	const hasBet = useGameStore((game: GameState) => game.hasBet);
	const gameStatus = useGameStore((game: GameState) => game.status);
	const isConnected = useGameStore((game: GameState) => game.isConnected);
	const isLoggedIn = useGameStore((game: GameState) => game.isLoggedIn);
	const balances = useGameStore((game: GameState) => game.balances);

	const { placeBet } = useGameStore((game: GameState) => game.actions);

	const haveValidBet = /^[0-9]+(\.?[0-9])*$/.test(betAmount) && parseFloat(betAmount);

	const handleChangeBetAmount = (amount: string) => {
		setBetAmount(amount);
	}

	const handleChangeAutoCashOut = (amount: string) => {
		setAutoCashOut(amount);
	}

	const handleButtonClick = () => {
		if (!isConnected || !walletAuth.isWalletConnected)
			return;

		if (!isLoggedIn && walletAuth.canSignIn) {
			walletAuth.signIn();
			return;
		}

		if (!isLoggedIn)
			return;

		placeBet(betAmount, autoCashOut, currency);
	}

	const isButtonDisabled: boolean =
		!isConnected
		|| walletAuth.isSigningIn
		|| (!isLoggedIn && !walletAuth.canSignIn)
		|| (isLoggedIn && !haveValidBet);

	const getButtonText = () : string => {
		if (!isConnected)
			return 'Connecting...';

		if (!walletAuth.isWalletConnected)
			return 'Connect Wallet';

		if (walletAuth.isSigningIn)
			return 'Sign message in wallet';

		if (!isLoggedIn) {
			if (walletAuth.canSignIn)
				return 'Sign In';
			else
				return 'Connect Wallet';
		}

		if (gameStatus == 'Waiting') {
			if (hasBet) {
				return 'Cancel bet';
			} else {
				return 'Place bet';
			}
		} else {
			if (hasBet) {
				return 'Cash out';
			} else {
				return 'Place bet (next round)';
			}
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Place your bets!</CardTitle>
			</CardHeader>

			<CardContent>
				<Label>Bet Amount</Label>
				<Input
					placeholder="Bet amount"
					type="number"
					min="0"
					onChange={(e) => handleChangeBetAmount(e.target.value)}
					value={betAmount}
				/>
				<Label>Auto Cashout</Label>
				<Input
					placeholder="Auto cashout"
					type="number"
					min="0"
					step="0.01"
					onChange={(e) => handleChangeAutoCashOut(e.target.value)}
					value={autoCashOut}
				/>
				<Label>Currency</Label>
				<CurrencyList balances={balances} />
			</CardContent>

			<CardFooter>
				<Button
					onClick={handleButtonClick}
					disabled={isButtonDisabled}
					className={styles.BetButton}
				>
					{getButtonText()}
				</Button>
			</CardFooter>
		</Card>
	);
}
