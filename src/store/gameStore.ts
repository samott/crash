"use client"

import { io } from "socket.io-client";

import { jwtDecode } from 'jwt-decode';

import { create } from "zustand";

import { elapsedToMultiplier } from '../lib/utils';

export type GameStatus =
	'Unknown'
	| 'Waiting'
	| 'Running'
	| 'Stopped'
	| 'Crashed';

export type JwtToken = {
	exp: number;
	nbf: number;
	wallet: string;
}

export type Bet = {
	wallet: string;
	betAmount: string;
	currency: string;
	autoCashOut: string;
	cashOut: string;
	cashOutTime: Date;
	isCashedOut: boolean;
	winnings: string;
}

export type CrashedGame = {
	id: string;
	duration: number,
	multiplier: string;
	players: number;
	winners: number;
	startTime: number;
	hash: string;
}

export type GameStateData = {
	gameId: string|null,
	status: GameStatus;
	players: Bet[];
	waiting: Bet[];
	startTime: number;
	isConnected: boolean;
	isLoggedIn: boolean;
	isWaiting: boolean;
	isPlaying: boolean
	isCashedOut: boolean;
	timeRemaining: number;
	timeElapsed: number;
	multiplier: string;
	crashes: CrashedGame[];
	balances: Record<string, string>;
	wallet: string|null;
}

export type GameActions = {
	authenticate: (message: string, signature: string) => void;
	switchWallet: (newWallet: string|null) => void;
	login: () => void;
	getNonce: () => Promise<string>;
	placeBet: (betAmount: string, autoCashOut: string, currency: string) => void;
	cashOut: () => void;
	cancelBet: () => void;
}

export type GameState = GameStateData & { actions: GameActions };

const initialState : GameStateData = {
	gameId: null,
	status: 'Unknown',
	players: [],
	waiting: [],
	startTime: 0,
	isConnected: false,
	isLoggedIn: false,
	isWaiting: false,
	isPlaying: false,
	isCashedOut: false,
	timeRemaining: 0,
	timeElapsed: 0,
	multiplier: '0',
	crashes: [],
	balances: {},
	wallet: null,
};

type GameWaitingEventParams = {
	startTime: number;
};

type GameRunningEventParams = {
	startTime: number;
};

type GameCrashedEventParams = {
	game: CrashedGame;
};

type BetListEventParams = {
	players: Bet[];
	waiting: Bet[];
};

type RecentGameListEventParams = {
	games: CrashedGame[];
};

type InitBalancesEventParams = {
	balances: Record<string, string>;
}

type UpdateBalancesEventParams = {
	currency: string;
	balance: string;
}

type PlayerWonEventParams = {
	wallet: string;
	multiplier: string;
}

type AuthenticateResponseParams = {
	success: boolean;
	token: string;
}

type LoginResponseParams = {
	success: boolean;
}

type NonceResponse = {
	nonce: string;
}

export const useGameStore = create<GameState>((set, get) => {
	const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
		withCredentials: true
	});

	let gameWaitTimer: ReturnType<typeof setInterval>|null = null;
	let gameRunTimer: ReturnType<typeof setInterval>|null = null;

	const gameWaiter = () => {
		const { startTime } = get();
		const timeRemaining = Math.round((startTime - new Date().getTime())/1000);

		if (timeRemaining <= 0) {
			set({ timeRemaining: 0 });

			if (gameWaitTimer) {
				clearInterval(gameWaitTimer);
				gameWaitTimer = null;
			}
		} else {
			set({ timeRemaining });
		}
	};

	const gameRunner = () => {
		const { startTime, status } = get();
		const timeElapsed = Math.round(new Date().getTime() - startTime);

		if (status != 'Running') {
			if (gameRunTimer) {
				clearInterval(gameRunTimer);
				gameRunTimer = null;
			}
		} else {
			set({
				timeElapsed,
				multiplier: elapsedToMultiplier(timeElapsed)
			});
		}
	};

	socket.on('connect', () => {
		console.log('Socket connected');

		const token = localStorage?.getItem('token') ?? null;

		if (token !== null)
			actions.login();

		set({ isConnected: true });
	});

	socket.on('disconnect', () => {
		console.log('Socket disconnected');
		set({ isConnected: false });
	});

	socket.on('GameWaiting', (params: GameWaitingEventParams) => {
		console.log('Game in waiting state')
		set({
			status: 'Waiting',
			startTime: params.startTime,
			timeElapsed: 0,
		});

		if (gameWaitTimer) {
			clearInterval(gameWaitTimer);
			gameWaitTimer = null;
		}

		gameWaitTimer = setInterval(gameWaiter, 1000);
	});

	socket.on('GameRunning', (params: GameRunningEventParams) => {
		console.log('Game in running state')

		console.log("StartTime latency:", new Date().getTime() - params.startTime);

		set({
			startTime: params.startTime,
			status: 'Running'
		});

		if (gameWaitTimer) {
			clearInterval(gameWaitTimer);
			gameWaitTimer = null;
		}

		if (gameRunTimer) {
			clearInterval(gameRunTimer);
			gameRunTimer = null;
		}

		gameRunTimer = setInterval(gameRunner, 5);
	});

	socket.on('GameCrashed', (params: GameCrashedEventParams) => {
		console.log('Game in crashed state')

		const { crashes } = get();

		set({
			status: 'Crashed',
			crashes: [...(
				crashes.length <= 30
					? crashes
					: crashes.slice(0, 30)
			), params.game],
			timeElapsed: params.game.duration,
		});

		if (gameWaitTimer) {
			clearInterval(gameWaitTimer);
			gameWaitTimer = null;
		}

		if (gameRunTimer) {
			clearInterval(gameRunTimer);
			gameRunTimer = null;
		}
	});

	socket.on('BetList', (params: BetListEventParams) => {
		console.log('Received bet list')

		const { wallet } = get();
		const playing = params.players.find((player) => player.wallet == wallet);
		const waiting = params.waiting.find((player) => player.wallet == wallet);
		const playerInList = playing ?? waiting;

		set({
			players: params.players,
			waiting: params.waiting,
			isWaiting: !!waiting,
			isPlaying: !!playing,
			isCashedOut: !!playerInList?.isCashedOut,
		});
	});

	socket.on('RecentGameList', (params: RecentGameListEventParams) => {
		console.log('Received recent game list')
		set({ crashes: params.games ?? [] });
	});

	socket.on('PlayerWon', (params: PlayerWonEventParams) => {
		console.log('Received player won event')

		const { players, wallet } = get();
		const index = players.findIndex((player) => player.wallet == params.wallet);

		if (index != -1) {
			const newPlayers = [...players];

			newPlayers[index].isCashedOut = true;
			newPlayers[index].cashOut = params.multiplier;
			newPlayers[index].cashOutTime = new Date();

			if (wallet == params.wallet) {
				set({ players: newPlayers, isCashedOut: true });
			} else {
				set({ players: newPlayers });
			}
		}
	});

	socket.on('InitBalances', (params: InitBalancesEventParams) => {
		console.log('Received balance list')
		set({ balances: params?.balances ?? {} });
	});

	socket.on('UpdateBalance', (params: UpdateBalancesEventParams) => {
		console.log('Received balance update')
		set({
			balances: {
				...get().balances ?? {},
				[params.currency]: params.balance
			}
		});
	});

	const actions = {
		authenticate: (
			message: string,
			signature: string
		) => {
			console.log('Authenticating...');

			socket.emit('authenticate', {
				message,
				signature
			}, (params: AuthenticateResponseParams) => {
				if (params?.success && params?.token) {
					console.log(`Token: ${params.token}`);
					localStorage.setItem('token', params.token);
					actions.login();
				}
			});
		},

		switchWallet: (newWallet: string|null) => {
			const { wallet } = get();

			if (wallet && wallet !== newWallet) {
				console.log('Wallet changed; logging out...');

				set({
					wallet: null,
					isLoggedIn: false
				});
			}
		},

		login: () => {
			console.log('Logging in with token...');

			const token = localStorage.getItem('token');

			if (token !== null) {
				const decoded: JwtToken = jwtDecode(token);

				if (!decoded.wallet)
					return;

				set({ wallet: decoded.wallet });

				socket.emit('login', { token }, (params: LoginResponseParams) => {
					if (params?.success)
						set({ isLoggedIn: true });
					else
						set({ isLoggedIn: false });
				});
			}
		},

		getNonce: async (): Promise<string> => {
			const response = await fetch(process.env.NEXT_PUBLIC_REST_URL! + '/nonce');
			const result = await response.json() as NonceResponse;

			if (!result?.nonce)
				throw new Error('Failed to query nonce API');

			return result?.nonce;
		},

		placeBet: (
			betAmount: string,
			autoCashOut: string,
			currency: string
		) => {
			console.log(`Placing bet ${betAmount} with currency ${currency} and autoCashOut ${autoCashOut}...`);

			socket.emit('placeBet', {
				betAmount,
				autoCashOut,
				currency
			});
		},

		cashOut: () => {
			console.log(`Cashing out...`);
			socket.emit('cashOut');
		},

		cancelBet: () => {
			console.log(`Cancelling bet...`);
			socket.emit('cancelBet');
		},
	};

	return {
		...initialState,
		actions
	};
});
