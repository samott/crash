import { PropsWithChildren }from 'react';

import styles from '../styles/components/GameLayout.module.css';

export type GameLayoutProps = PropsWithChildren;

export default function GameLayout({
	children
}: GameLayoutProps) {
	return <div className={styles.GameLayout}>{children}</div>;
}
