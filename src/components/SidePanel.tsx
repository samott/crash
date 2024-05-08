"use client"

import GameControls from './GameControls';
import BetList from './BetList';

import { useGameStore } from '../store/gameStore';

export default function SidePanel() {
	const bets = useGameStore((gameState) => gameState.waiting);

	return (
		<div>
			<GameControls />
			<BetList bets={bets ?? []} />
		</div>
	);
}
