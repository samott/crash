import { StaticImageData } from 'next/image';

import EthereumIcon from '../images/currencies/eth.svg';
import BitcoinIcon from '../images/currencies/btc.svg';

export type CurrencyId = 'eth' | 'btc';

export type Currency = {
	id: CurrencyId;
	name: string;
	units: string;
	icon: StaticImageData;
	decimals: number;
}

export const currencies: Currency[] = [
	{
		id: 'eth',
		name: 'Ethereum',
		units: 'ETH',
		icon:  EthereumIcon,
		decimals: 8,
	},
	{
		id: 'btc',
		name: 'Bitcoin',
		units: 'BTC',
		icon:  BitcoinIcon,
		decimals: 8,
	},
] as const;

export const currencyById = Object.fromEntries(
	currencies.map(currency => [currency.id, currency])
);
