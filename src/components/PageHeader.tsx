import DepositDialog from './DepositDialog';

import styles from '../styles/components/PageHeader.module.css';

export default function PageHeader() {
	return (
		<header className={styles.PageHeader}>
			<div className={styles.HeaderTitle}>
				<h1>Crash</h1>
			</div>

			<div className={styles.WalletButton}>
				<DepositDialog />
				<w3m-button />
			</div>
		</header>
	);
}
