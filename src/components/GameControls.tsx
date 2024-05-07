"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import CurrencyList from './CurrencyList';

const balances: Record<string, string> = {
	'eth': '0.05',
	'btc': '0.01',
};

export default function GameControls() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Place your bets!</CardTitle>
			</CardHeader>

			<CardContent>
				<Input placeholder="Bet amount" type="number" min="0" />
				<Input placeholder="Auto cashout" type="number" min="0" step="0.01" />
				<CurrencyList balances={balances} />
			</CardContent>

			<CardFooter>
				<Button>Place Bet</Button>
			</CardFooter>
		</Card>
	);
}
