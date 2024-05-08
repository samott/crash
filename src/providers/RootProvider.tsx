"use client"

import { PropsWithChildren } from 'react';

import Web3Modal from '../contexts/Web3Modal';

import { socket, SocketContext } from '../contexts/Socket';

export type RootProviderProps = PropsWithChildren;

export default function RootProvider({
	children
}: RootProviderProps) {
	return (
		<SocketContext.Provider value={socket}>
			<Web3Modal>
				{children}
			</Web3Modal>
		</SocketContext.Provider>
	);
}
