import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { GameStatus } from '../store/gameStore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const shortenWallet = (wallet: string): string => {
	return '#' + wallet.substring(2, 10).toUpperCase();
}

export const elapsedToMultiplier = (elapsed: number): string => {
	return Math.pow(Math.E, 6e-5 * elapsed).toFixed(2);
}
