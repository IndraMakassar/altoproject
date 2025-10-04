import { NextRequest, NextResponse } from "next/server";
import { claimTo } from "thirdweb/extensions/erc1155";
import { privateKeyToAccount } from "thirdweb/wallets";
import { sendTransaction } from "thirdweb/transaction";
import { getFreeNFTContract } from "@/lib/contracts/thirdweb";
import { supabaseAdmin } from "@/lib/database/supabase";
import { FreeClaimSchema } from "@/lib/types/validation";
import { createOrGetUser, hasUserClaimedNFTType, formatErrorResponse, formatSuccessResponse } from "@/lib/utils/helpers";

export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validatedData = FreeClaimSchema.parse(body);
		const { nfcTagId, userWallet, productId } = validatedData;

		// Check if NFC product exists and is active
		const { data: nfcProduct, error: nfcError } = await supabaseAdmin.from("nfc_products").select("*").eq("nfc_tag_id", nfcTagId).eq("product_id", productId).eq("is_active", true).single();

		if (nfcError || !nfcProduct) {
			return NextResponse.json(formatErrorResponse(null, "Invalid NFC tag or product not found"), { status: 404 });
		}

		// Check if user has already claimed free NFT
		const hasAlreadyClaimed = await hasUserClaimedNFTType(userWallet, "free");
		if (hasAlreadyClaimed) {
			return NextResponse.json(formatErrorResponse(null, "You have already claimed a free NFT"), { status: 400 });
		}

		// Create or get user
		const user = await createOrGetUser(userWallet);

		// Check how many times this user has claimed from this specific product
		const { data: existingClaims } = await supabaseAdmin
			.from("nft_claims")
			.select("id")
			.eq("user_id", (user as any).id)
			.eq("product_id", productId)
			.eq("nft_type", "free");

		if (existingClaims && existingClaims.length >= (nfcProduct as any).max_claims_per_user) {
			return NextResponse.json(formatErrorResponse(null, `Maximum ${(nfcProduct as any).max_claims_per_user} claim(s) allowed per product`), { status: 400 });
		}

		// Initialize contract and admin wallet
		const contract = getFreeNFTContract();
		const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;

		if (!adminPrivateKey) {
			throw new Error("Admin private key not configured");
		}

		const adminAccount = privateKeyToAccount({
			client: contract.client,
			privateKey: adminPrivateKey,
		});

		// Prepare mint transaction
		const tokenId = BigInt(0); // Use token ID 0 for free tier NFTs
		const quantity = BigInt(1);

		const transaction = claimTo({
			contract,
			to: userWallet,
			tokenId,
			quantity,
		});

		// Execute transaction
		const result = await sendTransaction({
			transaction,
			account: adminAccount,
		});

		// Record the claim in database
		const { error: claimError } = await supabaseAdmin.from("nft_claims").insert({
			user_id: (user as any).id,
			nft_type: "free",
			token_id: Number(tokenId),
			transaction_hash: result.transactionHash,
			product_id: productId,
		} as any);

		if (claimError) {
			console.error("Failed to record claim:", claimError);
			// Transaction was successful but failed to record - should handle this case
		}

		return NextResponse.json(
			formatSuccessResponse(
				{
					transaction_hash: result.transactionHash,
					token_id: Number(tokenId),
					product_name: (nfcProduct as any).product_name,
				},
				"Free NFT claimed successfully!"
			)
		);
	} catch (error) {
		console.error("Free claim error:", error);

		if (error instanceof Error && error.message.includes("ZodError")) {
			return NextResponse.json(formatErrorResponse(error, "Invalid request data"), { status: 400 });
		}

		return NextResponse.json(formatErrorResponse(error, "Failed to claim free NFT"), { status: 500 });
	}
}
