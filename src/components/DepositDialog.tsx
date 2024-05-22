"use client"

import { useState } from 'react';

import Decimal from 'decimal.js';

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer"

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import useWalletBalances from '../hooks/useWalletBalances';
import useWalletAuth from '../hooks/useWalletAuth';

import { currencies } from '../lib/currencies';

import CurrencyList from "../components/CurrencyList";

import styles from '../styles/components/DepositDialog.module.css';

export default function DepositDialog() {
	const [depositAmount, setDepositAmount] = useState<string>('0');
	const [currency, setCurrency] = useState<string>(currencies[0].id);

	const { balances, allowances } = useWalletBalances();
	const { isWalletConnected } = useWalletAuth();

	const haveValidAmount = /^[0-9]+(\.?[0-9])*$/.test(depositAmount) && parseFloat(depositAmount);

	const safeDepositAmount = haveValidAmount ? depositAmount : '0';
	const safeAllowance = currency ? (allowances?.[currency] ?? '0') : '0';
	const safeBalance = currency ? (balances?.[currency] ?? '0') : '0';

	const hasEnoughAllowance =
		new Decimal(safeAllowance).greaterThanOrEqualTo(safeDepositAmount);

	const hasEnoughBalance =
		new Decimal(safeBalance).greaterThanOrEqualTo(safeDepositAmount);

	const emptyDepositAmount =
		new Decimal(safeDepositAmount).equals('0');

	if (!isWalletConnected)
		return <></>;

	return (
		 <Drawer>
			<DrawerTrigger asChild>
				<Button>Deposit</Button>
			</DrawerTrigger>
			<DrawerContent>
				<div className={styles.DepositDialogInnerContent}>
					<DrawerHeader>
						<DrawerTitle>Deposit to Contract</DrawerTitle>
					</DrawerHeader>
					<Label>Wallet balances</Label>
					<CurrencyList balances={balances} />
					<Label>Amount</Label>
					<Input
						placeholder="Deposit amount"
						type="number"
						min="0"
						onChange={(e) => setDepositAmount(e.target.value)}
						value={depositAmount}
					/>
					<DrawerFooter>
						<Button disabled={emptyDepositAmount || !hasEnoughBalance}>1. Approve token</Button>
						<Button disabled={!hasEnoughAllowance || emptyDepositAmount}>2. Complete deposit</Button>
						<DrawerClose asChild>
							<Button variant="outline">Cancel</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
