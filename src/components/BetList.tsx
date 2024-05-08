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

import { Bet } from '../store/gameStore';

import { shortenWallet } from '../lib/utils';

export type BetListProps = {
	bets: Bet[];
}

export default function BetList({
	bets
}: BetListProps) {
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
						{bets.map((bet) => (
							<TableRow key={bet.wallet}>
								<TableCell className="font-medium">{shortenWallet(bet.wallet ?? 'User')}</TableCell>
								<TableCell>
									{bet.amount}{" "}
									{currencyById[bet.currency]?.units ?? bet.currency.toUpperCase()}
								</TableCell>
								<TableCell>{bet.cashOut ? `${bet.cashOut}x` : '-'}</TableCell>
								<TableCell className="text-right">
									{bet.winnings}{" "}
									{currencyById[bet.currency]?.units ?? bet.currency.toUpperCase()}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
