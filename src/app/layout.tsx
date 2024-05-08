import RootProvider from '../providers/RootProvider';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import PageHeader from '../components/PageHeader';
import PageFooter from '../components/PageFooter';

export const metadata: Metadata = {
	title: "Crash",
	description: "Crash",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<RootProvider>
			<html lang="en">
				<body className={inter.className}>
					<PageHeader />
					{children}
					<PageFooter />
				</body>
			</html>
		</RootProvider>
	);
}
