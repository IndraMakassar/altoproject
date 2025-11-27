"use client";

import { ThirdwebProvider } from "thirdweb/react";
import {chain, wallets} from "@/lib/thirdweb";

export function ClientProviders({ children }: { children: React.ReactNode }) {

    return (
            <ThirdwebProvider activeChain={chain} wallets={wallets}>
                {children}
            </ThirdwebProvider>
    );
}
