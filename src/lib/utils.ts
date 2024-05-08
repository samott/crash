import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const shortenWallet = (wallet: string): string => {
	return '#' + wallet.substring(2, 8);
}
