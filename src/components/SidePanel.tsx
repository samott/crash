import GameControls from './GameControls';
import BetList from './BetList';

import { CurrencyId } from '../lib/currencies';

const bets = [{
	username: '#11111111',
	amount: '0.0005',
	currency: 'eth' as CurrencyId,
	cashout: '1.32',
	winnings: '0.099'
}];

export default function SidePanel() {
	return (
		<div>
			<GameControls />
			<BetList bets={bets} />
		</div>
	);
}
