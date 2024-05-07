import styles from "./page.module.css";

import Game from '../components/Game';
import SidePanel from '../components/SidePanel';

export default function Home() {
	return (
		<main className={styles.main}>
			<SidePanel />
			<Game />
		</main>
	);
}
