"use client";

import Decimal from 'decimal.js';

import { Label } from '@/components/ui/label';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
 
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { currencyById } from '../lib/currencies';

import { Bet, useGameStore } from '../store/gameStore';

import { shortenWallet } from '../lib/utils';

export type BetListProps = {
}

const renderCashOut = (bet: Bet): string => {
	if (bet.cashOut != '0.00')
		return `${bet.cashOut}x`;

	if (bet.autoCashOut != '0.00')
		return `${bet.autoCashOut}x`;

	return '-';
}

const renderWinnings = (bet: Bet): string => {
	if (!bet.isCashedOut)
		return '-';

	return new Decimal(bet.betAmount).mul(bet.cashOut).toString();
}

export type BetItemProps = {
	bet: Bet;
	isWaiting: boolean;
}

export function BetItem({ bet, isWaiting }: BetItemProps) {
	return (
		<TableRow>
			<TableCell className="font-medium whitespace-nowrap">
				{shortenWallet(bet.wallet ?? 'User')}
				{isWaiting ? ' ⌛' : ''}
			</TableCell>
			<TableCell>
				{bet.betAmount}{" "}
				{currencyById[bet.currency]?.units ?? bet.currency.toUpperCase()}
			</TableCell>
			<TableCell>{renderCashOut(bet)}</TableCell>
			<TableCell className="text-right">
				{renderWinnings(bet)}{" "}
				{currencyById[bet.currency]?.units ?? bet.currency.toUpperCase()}
			</TableCell>
		</TableRow>
	);
}

export default function BetList({}: BetListProps) {
	const players = useGameStore((gameState) => gameState.players);
	const waiting = useGameStore((gameState) => gameState.waiting);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Bets</CardTitle>
			</CardHeader>

			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">Player</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Cashout</TableHead>
							<TableHead className="text-right">Winnings</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{players.map((bet) =>
							<BetItem
								bet={bet}
								isWaiting={false}
								key={bet.wallet + '_wait'}
							/>)}
						{waiting.map((bet) =>
							<BetItem
								bet={bet}
								isWaiting={true}
								key={bet.wallet + '_play'}
							/>)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
