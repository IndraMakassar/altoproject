// lib/thirdweb.ts - POLYGON ONLY CONFIGURATION
import { createThirdwebClient, getContract } from "thirdweb";
import { polygon, polygonAmoy } from "thirdweb/chains";

// ============================================================================
// CLIENT CONFIGURATION
// ============================================================================

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const secretKey = process.env.THIRDWEB_SECRET_KEY;

function validateEnv() {
    if (!clientId) throw new Error("Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID");
}

// Create single unified client
export const client = createThirdwebClient({
    clientId: clientId || "placeholder-client",
    ...(secretKey && { secretKey }), // Only include secretKey if it exists (server-side)
});

// ============================================================================
// CHAIN CONFIGURATION
// ============================================================================

// Only Polygon chains
export const supportedChains = [polygon, polygonAmoy];

// Active chain based on environment variable
export const chain =
    process.env.NEXT_PUBLIC_CHAIN === "polygon" ? polygon : polygonAmoy;

// ============================================================================
// NFT CONTRACT CONFIGURATION
// ============================================================================

export const nftContracts = [
    {
        key: "free",
        name: "Free NFT",
        address: process.env.NEXT_PUBLIC_FREE_NFT_CONTRACT,
    },
    // {
        // key: "voucher",
        // name: "Voucher NFT",
        // address: process.env.NEXT_PUBLIC_VOUCHER_NFT_CONTRACT,
    // },
    // {
    //     key: "paid",
    //     name: "Paid NFT",
    //     address: process.env.NEXT_PUBLIC_PAID_NFT_CONTRACT,
    // },
];

// Warn on missing addresses (only in development)
if (process.env.NODE_ENV === "development") {
    nftContracts.forEach((c) => {
        if (!c.address) console.warn(`⚠️ Missing address for: ${c.key}`);
    });
}

// ============================================================================
// CONTRACT HELPER FUNCTIONS
// ============================================================================

export function getNFTContract(key: string) {
    validateEnv();

    const found = nftContracts.find((c) => c.key === key);

    if (!found) {
        throw new Error(`Contract not found for key: ${key}`);
    }
    if (!found.address) {
        throw new Error(
            `Address missing for contract key: ${key}. Check your .env file for NEXT_PUBLIC_${key.toUpperCase()}_NFT_CONTRACT`
        );
    }

    return getContract({
        client,
        chain,
        address: found.address,
    });
}

