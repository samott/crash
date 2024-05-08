"use client"

import { PropsWithChildren } from 'react';

import Web3Modal from '../contexts/Web3Modal';

export type RootProviderProps = PropsWithChildren;

export default function RootProvider({
	children
}: RootProviderProps) {
	return (
		<Web3Modal>
			{children}
		</Web3Modal>
	);
}
