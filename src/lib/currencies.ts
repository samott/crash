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
	contractDecimals: number;
}

export const currencies: Currency[] = [
	{
		id: 'eth',
		name: 'Ethereum',
		units: 'ETH',
		icon:  EthereumIcon,
		decimals: 8,
		contractDecimals: 18,
	},
	{
		id: 'btc',
		name: 'Bitcoin',
		units: 'BTC',
		icon:  BitcoinIcon,
		decimals: 8,
		contractDecimals: 8,
	},
	/*{
		id: 'usdc',
		name: 'USDC',
		units: 'USDC',
		icon:  UsdcIcon,
		decimals: 2,
		contractDecimals: 6,
	},*/
] as const;

export const coinContracts: Record<string, Record<string, string>> = {
	'0x89': {
		'eth': '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
		'btc': '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
		//'usdc': '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
	},
	'0x13881': {
		'eth': '0xD92f1A998A1F76913d1Aad3923fDf9dFAD73F013',
		'btc': '0xB568bd9F4572cdb62099ab2e70a25277c5118b15',
		//'usdc': '0xE8F6F19f030921860765975cf99bcF513832b285'
	}
} as const;

export const currencyById = Object.fromEntries(
	currencies.map(currency => [currency.id, currency])
);
