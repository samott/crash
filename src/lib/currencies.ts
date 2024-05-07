import { StaticImageData } from 'next/image';

import EthereumIcon from '../images/currencies/eth.svg';
import BitcoinIcon from '../images/currencies/btc.svg';

export type Currency = {
	id: string;
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
