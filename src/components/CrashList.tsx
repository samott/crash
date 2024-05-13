import styles from '../styles/components/CrashList.module.css';

import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";

export type CrashedGame = {
	gameId: string;
	hash: string;
	duration: number;
	multiplier: string;
	startTime: number;
	escapees: number;
	players: number;
}

export type CrashListProps = {}

export default function CrashList({}: CrashListProps) {
	const crashes = [{
		gameId: '86d838fb-1125-11ef-8984-00e04c6804ae',
		hash: '80348020432',
		duration: 1000,
		multiplier: "1.05",
		startTime: new Date().getTime(),
		escapees: 1,
		players: 13,
	}, {
		gameId: '86d838fb-1125-11ef-8984-00e04c680422',
		hash: '80348020432',
		duration: 1000,
		multiplier: "1.45",
		startTime: new Date().getTime(),
		escapees: 4,
		players: 6,
	}];

	return (
		<div className={styles.CrashList}>
			{crashes.map((crash: CrashedGame) =>
				<HoverCard key={crash.gameId}>
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
							<span>Escapees:</span>
							<span>{crash.escapees}/{crash.players}</span>
						</div>
					</HoverCardContent>
				</HoverCard>
			)}
		</div>
	);
}
