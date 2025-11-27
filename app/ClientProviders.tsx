"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { supportedChains, chain as defaultChain } from "@/lib/thirdweb";
import React, { createContext, useState, useContext, useMemo } from "react";

const ChainSelectorContext = createContext({
    chain: defaultChain,
    setChain: (_c: typeof defaultChain) => {},
    supportedChains,
});

export function useChainSelector() {
    return useContext(ChainSelectorContext);
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const [chain, setChain] = useState(defaultChain);

    const contextValue = useMemo(
        () => ({ chain, setChain, supportedChains }),
        [chain]
    );

    return (
        <ChainSelectorContext.Provider value={contextValue}>
            <ThirdwebProvider activeChain={chain}>
                {children}
            </ThirdwebProvider>
        </ChainSelectorContext.Provider>
    );
}
