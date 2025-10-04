"use client";

import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { supportedChains, chain as defaultChain } from "@/lib/thirdweb";
import React, { createContext, useState, useContext, useMemo } from "react";

// Context for selected chain
const ChainSelectorContext = createContext({
	chain: defaultChain,
	setChain: (_c: typeof defaultChain) => {},
	supportedChains,
});

export function useChainSelector() {
	return useContext(ChainSelectorContext);
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const [chain, setChain] = useState(defaultChain);

	// Memoize context value to prevent unnecessary re-renders
	const contextValue = useMemo(
		() => ({
			chain,
			setChain,
			supportedChains,
		}),
		[chain]
	); // Only re-create when chain actually changes

	return (
		<html lang="en">
			<body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
				<ChainSelectorContext.Provider value={contextValue}>
					<ThirdwebProvider>
						<div className="min-h-screen">
							<header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
								<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
												<span className="text-white font-bold text-lg">N</span>
											</div>
											<div>
												<h1 className="text-xl font-bold text-gray-900 dark:text-white">NFT Claim Demo</h1>
												<p className="text-sm text-gray-500 dark:text-gray-400">Next.js 15 + Thirdweb v5 + Gasless Claims</p>
											</div>
										</div>
									</div>
								</div>
							</header>
							<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
						</div>
					</ThirdwebProvider>
				</ChainSelectorContext.Provider>
			</body>
		</html>
	);
}
