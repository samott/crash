"use client";

import styles from '../styles/components/CrashList.module.css';

import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";

import { useGameStore, CrashedGame } from '../store/gameStore';

export type CrashListProps = {}

export default function CrashList({}: CrashListProps) {
	const crashes = useGameStore((gameState) => gameState.crashes);

	return (
		<div className={styles.CrashList}>
			{crashes.map((crash: CrashedGame) =>
				<HoverCard key={crash.id}>
					<HoverCardTrigger>
						<div className={styles.CrashListItem}>
							{ crash.multiplier }x
						</div>
					</HoverCardTrigger>
					<HoverCardContent>
						<div className={styles.CrashStats}>
							<span>Date:</span>
							<span>{crash.startTime}</span>
							<span>Hash:</span>
							<span>{crash.hash}</span>
							<span>Duration:</span>
							<span>{Number(crash.duration/1000).toFixed(2)} secs</span>
							<span>Mulitplier:</span>
							<span>{crash.multiplier}x</span>
							<span>Winners:</span>
							<span>{crash.winners}/{crash.players}</span>
						</div>
					</HoverCardContent>
				</HoverCard>
			)}
		</div>
	);
}
