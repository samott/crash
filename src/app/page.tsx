import styles from "./page.module.css";

import Game from '../components/Game';

export default function Home() {

	return (
		<main className={styles.main}>
			<Game />
		</main>
	);
}
