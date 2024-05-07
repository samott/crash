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

import { currencyById, CurrencyId } from '../lib/currencies';

export type Bet = {
	username: string;
	amount: string;
	currency: CurrencyId;
	cashout: string;
	winnings: string;
}

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
							<TableHead>Bet Amount</TableHead>
							<TableHead>Cashout</TableHead>
							<TableHead className="text-right">Winnings</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{bets.map((bet) => (
							<TableRow key={bet.username}>
								<TableCell className="font-medium">{bet.username}</TableCell>
								<TableCell>
									{bet.amount}{" "}
									{currencyById[bet.currency]?.units ?? bet.currency.toUpperCase()}
								</TableCell>
								<TableCell>{bet.cashout}x</TableCell>
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
