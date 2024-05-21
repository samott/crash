"use client"

import { io } from "socket.io-client";

import { create } from "zustand";

import { elapsedToMultiplier } from '../lib/utils';

export type GameStatus =
	'Unknown'
	| 'Waiting'
	| 'Running'
	| 'Stopped'
	| 'Crashed';

export type Bet = {
	wallet: string;
	amount: string;
	currency: string;
	cashOut: string;
	cashedOut: boolean;
	winnings: string;
}

export type CrashedGame = {
	id: string;
	duration: number,
	multiplier: string;
	players: number;
	winners: number;
	startTime: number;
}

export type GameStateData = {
	gameId: string|null,
	status: GameStatus;
	players: Bet[];
	waiting: Bet[];
	startTime: number;
	isConnected: boolean;
	isLoggedIn: boolean;
	hasBet: boolean;
	timeRemaining: number;
	timeElapsed: number;
	multiplier: string;
	crashes: CrashedGame[];
	balances: Record<string, string>;
}

export type GameActions = {
	authenticate: (message: string, signature: string) => void;
	login: () => void;
	placeBet: (betAmount: string, autoCashOut: string, currency: string) => void;
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
	hasBet: false,
	timeRemaining: 0,
	timeElapsed: 0,
	multiplier: '0',
	crashes: [],
	balances: {},
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

type InitBalancesEventParams = {
	balances: Record<string, string>;
}

type AuthenticateResponseParams = {
	success: boolean;
	token: string;
}

type LoginResponseParams = {
	success: boolean;
}

export const useGameStore = create<GameState>((set, get) => {
	const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
		withCredentials: true
	});

	let gameWaitTimer: ReturnType<typeof setInterval>|null = null;
	let gameRunTimer: ReturnType<typeof setInterval>|null = null;

	const gameWaiter = () => {
		const { startTime } = get();
		const timeRemaining = Math.round(startTime - new Date().getTime()/1000);

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
		const timeElapsed = Math.round(new Date().getTime() - startTime*1000);

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
		setInterval(gameWaiter, 1000);
	});

	socket.on('GameRunning', (params: GameRunningEventParams) => {
		console.log('Game in running state')

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

		setInterval(gameRunner, 5);
	});

	socket.on('GameCrashed', (params: GameCrashedEventParams) => {
		console.log('Game in crashed state')

		const { crashes } = get();

		set({
			status: 'Crashed',
			crashes: [...crashes, params.game]
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

		set({
			players: params.players,
			waiting: params.waiting
		});
	});

	socket.on('InitBalances', (params: InitBalancesEventParams) => {
		console.log('Received balance list')
		set({ balances: params.balances });
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

		login: () => {
			console.log('Logging in with token...');

			const token = localStorage.getItem('token');

			if (token !== null)
				socket.emit('login', { token }, (params: LoginResponseParams) => {
					if (params?.success)
						set({ isLoggedIn: true });
					else
						set({ isLoggedIn: false });
				});
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

		cancelBet: () => {
			console.log(`Cancelling bet...`);

			socket.emit('cancelBet');
		},
	};

	if (typeof localStorage !== 'undefined') {
		const token = localStorage?.getItem('token') ?? null;

		if (token !== null)
			actions.login();
	}

	return {
		...initialState,
		actions
	};
});
