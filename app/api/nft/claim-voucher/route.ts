import { NextRequest, NextResponse } from "next/server";
import { claimTo } from "thirdweb/extensions/erc1155";
import { privateKeyToAccount } from "thirdweb/wallets";
import { sendTransaction } from "thirdweb/transaction";
import { getVoucherNFTContract } from "@/lib/contracts/thirdweb";
import { supabaseAdmin } from "@/lib/database/supabase";
import { VoucherClaimSchema } from "@/lib/types/validation";
import { createOrGetUser, hasUserClaimedNFTType, formatErrorResponse, formatSuccessResponse } from "@/lib/utils/helpers";

export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validatedData = VoucherClaimSchema.parse(body);
		const { voucherCode, userWallet } = validatedData;

		// Check if voucher code exists and is unused
		const { data: voucher, error: voucherError } = await supabaseAdmin.from("voucher_codes").select("*").eq("code", voucherCode).eq("is_used", false).single();

		if (voucherError || !voucher) {
			return NextResponse.json(formatErrorResponse(null, "Invalid or already used voucher code"), { status: 404 });
		}

		// Check if user has already claimed voucher NFT
		const hasAlreadyClaimed = await hasUserClaimedNFTType(userWallet, "voucher");
		if (hasAlreadyClaimed) {
			return NextResponse.json(formatErrorResponse(null, "You have already claimed a voucher NFT"), { status: 400 });
		}

		// Create or get user
		const user = await createOrGetUser(userWallet);

		// Initialize contract and admin wallet
		const contract = getVoucherNFTContract();
		const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;

		if (!adminPrivateKey) {
			throw new Error("Admin private key not configured");
		}

		const adminAccount = privateKeyToAccount({
			client: contract.client,
			privateKey: adminPrivateKey,
		});

		// Prepare mint transaction
		const tokenId = BigInt(1); // Use token ID 1 for voucher tier NFTs
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

		// Mark voucher as used and record the claim in a transaction
		const { error: updateError } = await supabaseAdmin.rpc("claim_voucher_nft", {
			p_voucher_code: voucherCode,
			p_user_id: (user as any).id,
			p_token_id: Number(tokenId),
			p_transaction_hash: result.transactionHash,
		} as any);

		if (updateError) {
			console.error("Failed to update voucher and record claim:", updateError);
			// You might want to implement a rollback mechanism here
		}

		return NextResponse.json(
			formatSuccessResponse(
				{
					transaction_hash: result.transactionHash,
					token_id: Number(tokenId),
					voucher_code: voucherCode,
				},
				"Voucher NFT claimed successfully!"
			)
		);
	} catch (error) {
		console.error("Voucher claim error:", error);

		if (error instanceof Error && error.message.includes("ZodError")) {
			return NextResponse.json(formatErrorResponse(error, "Invalid request data"), { status: 400 });
		}

		return NextResponse.json(formatErrorResponse(error, "Failed to claim voucher NFT"), { status: 500 });
	}
}
