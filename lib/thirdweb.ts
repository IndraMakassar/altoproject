import { createThirdwebClient } from "thirdweb";
import { base, baseSepolia, ethereum, polygon, arbitrum, optimism, defineChain } from "thirdweb/chains";

export const client = createThirdwebClient({
	clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// Definisi Base Sepolia dengan detail lengkap untuk memastikan kompatibilitas
export const baseSepoliaChain = defineChain({
	id: 84532,
	name: "Base Sepolia",
	nativeCurrency: {
		name: "Ether",
		symbol: "ETH",
		decimals: 18,
	},
	rpc: "https://sepolia.base.org",
	blockExplorers: [
		{
			name: "BaseScan",
			url: "https://sepolia.basescan.org",
		},
	],
	testnet: true,
});

// Chain mapping untuk berbagai opsi
const chainMap = {
	base: base,
	"base-sepolia": baseSepoliaChain, // Menggunakan definisi custom
	ethereum: ethereum,
	polygon: polygon,
	arbitrum: arbitrum,
	optimism: optimism,
};

// Default ke base mainnet
export const chain = chainMap[process.env.NEXT_PUBLIC_CHAIN as keyof typeof chainMap] || base;

export const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

// Daftar chain yang ingin didukung di UI modal
export const supportedChains = [base, baseSepoliaChain, ethereum, polygon, arbitrum, optimism];

// Untuk digunakan di _app.tsx atau root layout:
// <ChainProvider chains={supportedChains}>{children}</ChainProvider>
