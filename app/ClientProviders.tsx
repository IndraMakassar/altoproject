"use client";

import {ThirdwebProvider} from "thirdweb/react";
import {ReactNode} from "react";
import QueryProvider from "@/app/providers/QueryProvider";

export default function ClientProviders({children}: { children: ReactNode }) {
    return (
        <ThirdwebProvider>
            <QueryProvider>
                {children}
            </QueryProvider>
        </ThirdwebProvider>
    );
}