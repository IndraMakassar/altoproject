import { nanoid } from "nanoid";
import { supabaseAdmin } from "../database/supabase";

/**
 * Generate a unique voucher code
 */
export function generateVoucherCode(prefix: string = "FASHION"): string {
	const randomPart = nanoid(8).toUpperCase();
	return `${prefix}${randomPart}`;
}

/**
 * Validate wallet address format
 */
export function isValidWalletAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if user has already claimed a specific NFT type
 */
export async function hasUserClaimedNFTType(userWallet: string, nftType: "free" | "voucher" | "paid"): Promise<boolean> {
	try {
		// First get user ID from wallet address
		const { data: user } = await supabaseAdmin.from("users").select("id").eq("wallet_address", userWallet).single();

		if (!user) return false;

		// Check if user has claimed this NFT type
		const { data: claim } = await supabaseAdmin
			.from("nft_claims")
			.select("id")
			.eq("user_id", (user as any).id)
			.eq("nft_type", nftType)
			.single();

		return !!claim;
	} catch (error) {
		console.error("Error checking NFT claim status:", error);
		return false;
	}
}

/**
 * Get user's NFT claims by wallet address
 */
export async function getUserNFTClaims(userWallet: string) {
	try {
		// Get user ID
		const { data: user } = await supabaseAdmin.from("users").select("id").eq("wallet_address", userWallet).single();

		if (!user) return [];

		// Get all claims
		const { data: claims } = await supabaseAdmin
			.from("nft_claims")
			.select("*")
			.eq("user_id", (user as any).id)
			.order("claimed_at", { ascending: false });

		return claims || [];
	} catch (error) {
		console.error("Error getting user NFT claims:", error);
		return [];
	}
}

/**
 * Create or get user by wallet address
 */
export async function createOrGetUser(
	walletAddress: string,
	additionalData?: {
		email?: string;
		google_id?: string;
		phone?: string;
	}
) {
	try {
		// Try to get existing user
		const { data: existingUser } = await supabaseAdmin.from("users").select("*").eq("wallet_address", walletAddress).single();

		if (existingUser) {
			return existingUser;
		}

		// Create new user
		const { data: newUser, error } = await supabaseAdmin
			.from("users")
			.insert({
				wallet_address: walletAddress,
				...additionalData,
			} as any)
			.select()
			.single();

		if (error) throw error;
		return newUser;
	} catch (error) {
		console.error("Error creating/getting user:", error);
		throw error;
	}
}

/**
 * Format error response
 */
export function formatErrorResponse(error: unknown, defaultMessage: string = "An error occurred") {
	console.error("API Error:", error);

	if (error instanceof Error) {
		return {
			success: false,
			error: error.message,
		};
	}

	return {
		success: false,
		error: defaultMessage,
	};
}

/**
 * Format success response
 */
export function formatSuccessResponse<T>(data: T, message?: string) {
	return {
		success: true,
		data,
		message,
	};
}
