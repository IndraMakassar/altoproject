import { createThirdwebClient, getContract } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";

// Validate required environment variables
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
const secretKey = process.env.THIRDWEB_SECRET_KEY;

// Runtime validation - only throw if actually calling the functions
function validateEnvVars() {
	if (!clientId) {
		throw new Error("Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID environment variable");
	}

	if (!secretKey) {
		throw new Error("Missing THIRDWEB_SECRET_KEY environment variable");
	}
}

// Create Thirdweb client
export const client = createThirdwebClient({
	clientId: clientId || "placeholder-client-id",
	secretKey: secretKey || "placeholder-secret-key",
});

// Chain configuration
const chainEnv = process.env.NEXT_PUBLIC_CHAIN || "base-sepolia";
export const chain = chainEnv === "base" ? base : baseSepolia;

// Contract addresses
export const FREE_NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FREE_NFT_CONTRACT;
export const VOUCHER_NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOUCHER_NFT_CONTRACT;
export const PAID_NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAID_NFT_CONTRACT;

// Export supported chains for layout
export const supportedChains = [base, baseSepolia];

// Validate contract addresses
if (!FREE_NFT_CONTRACT_ADDRESS) {
	console.warn("Warning: FREE_NFT_CONTRACT_ADDRESS not set");
}

if (!VOUCHER_NFT_CONTRACT_ADDRESS) {
	console.warn("Warning: VOUCHER_NFT_CONTRACT_ADDRESS not set");
}

if (!PAID_NFT_CONTRACT_ADDRESS) {
	console.warn("Warning: PAID_NFT_CONTRACT_ADDRESS not set");
}

// Contract instances
export const getFreeNFTContract = () => {
	validateEnvVars();
	if (!FREE_NFT_CONTRACT_ADDRESS) {
		throw new Error("Free NFT contract address not configured");
	}
	return getContract({
		client,
		chain,
		address: FREE_NFT_CONTRACT_ADDRESS,
	});
};

export const getVoucherNFTContract = () => {
	validateEnvVars();
	if (!VOUCHER_NFT_CONTRACT_ADDRESS) {
		throw new Error("Voucher NFT contract address not configured");
	}
	return getContract({
		client,
		chain,
		address: VOUCHER_NFT_CONTRACT_ADDRESS,
	});
};

export const getPaidNFTContract = () => {
	validateEnvVars();
	if (!PAID_NFT_CONTRACT_ADDRESS) {
		throw new Error("Paid NFT contract address not configured");
	}
	return getContract({
		client,
		chain,
		address: PAID_NFT_CONTRACT_ADDRESS,
	});
};
