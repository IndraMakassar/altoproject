import { NextRequest, NextResponse } from "next/server";
import { claimTo } from "thirdweb/extensions/erc1155";
import { privateKeyToAccount } from "thirdweb/wallets";
import { sendTransaction } from "thirdweb/transaction";
import { getPaidNFTContract } from "@/lib/contracts/thirdweb";
import { supabaseAdmin } from "@/lib/database/supabase";
import { PaidClaimSchema } from "@/lib/types/validation";
import { createOrGetUser, hasUserClaimedNFTType, formatErrorResponse, formatSuccessResponse } from "@/lib/utils/helpers";

// Midtrans types
interface MidtransVerification {
	transaction_status: string;
	payment_type: string;
	gross_amount: string;
	order_id: string;
}

async function verifyMidtransPayment(paymentToken: string): Promise<MidtransVerification | null> {
	try {
		const serverKey = process.env.MIDTRANS_SERVER_KEY;
		const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

		if (!serverKey) {
			throw new Error("Midtrans server key not configured");
		}

		const baseUrl = isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";

		const auth = Buffer.from(`${serverKey}:`).toString("base64");

		const response = await fetch(`${baseUrl}/v2/${paymentToken}/status`, {
			headers: {
				Authorization: `Basic ${auth}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to verify payment");
		}

		return await response.json();
	} catch (error) {
		console.error("Midtrans verification error:", error);
		return null;
	}
}

export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validatedData = PaidClaimSchema.parse(body);
		const { userWallet, paymentToken } = validatedData;

		// Verify payment with Midtrans
		const paymentData = await verifyMidtransPayment(paymentToken);

		if (!paymentData || paymentData.transaction_status !== "settlement") {
			return NextResponse.json(formatErrorResponse(null, "Payment not verified or not completed"), { status: 400 });
		}

		// Check if user is eligible (has both free and voucher NFTs)
		const [hasFreeNFT, hasVoucherNFT, hasPaidNFT] = await Promise.all([hasUserClaimedNFTType(userWallet, "free"), hasUserClaimedNFTType(userWallet, "voucher"), hasUserClaimedNFTType(userWallet, "paid")]);

		if (!hasFreeNFT || !hasVoucherNFT) {
			return NextResponse.json(formatErrorResponse(null, "You must own both free and voucher NFTs to purchase paid NFT"), { status: 400 });
		}

		if (hasPaidNFT) {
			return NextResponse.json(formatErrorResponse(null, "You have already claimed the paid NFT"), { status: 400 });
		}

		// Create or get user
		const user = await createOrGetUser(userWallet);

		// Initialize contract and admin wallet
		const contract = getPaidNFTContract();
		const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;

		if (!adminPrivateKey) {
			throw new Error("Admin private key not configured");
		}

		const adminAccount = privateKeyToAccount({
			client: contract.client,
			privateKey: adminPrivateKey,
		});

		// Prepare mint transaction
		const tokenId = BigInt(2); // Use token ID 2 for paid tier NFTs
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
			nft_type: "paid",
			token_id: Number(tokenId),
			transaction_hash: result.transactionHash,
		} as any);

		if (claimError) {
			console.error("Failed to record claim:", claimError);
		}

		// TODO: You might want to store payment details in a separate payments table
		// for better tracking and reconciliation

		return NextResponse.json(
			formatSuccessResponse(
				{
					transaction_hash: result.transactionHash,
					token_id: Number(tokenId),
					payment_id: paymentData.order_id,
					amount_paid: paymentData.gross_amount,
				},
				"Paid NFT claimed successfully!"
			)
		);
	} catch (error) {
		console.error("Paid claim error:", error);

		if (error instanceof Error && error.message.includes("ZodError")) {
			return NextResponse.json(formatErrorResponse(error, "Invalid request data"), { status: 400 });
		}

		return NextResponse.json(formatErrorResponse(error, "Failed to claim paid NFT"), { status: 500 });
	}
}
