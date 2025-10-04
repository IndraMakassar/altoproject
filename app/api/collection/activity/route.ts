import { NextRequest, NextResponse } from "next/server";
import { getUserNFTClaims, formatErrorResponse, formatSuccessResponse } from "@/lib/utils/helpers";
import { chain } from "@/lib/contracts/thirdweb";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const walletAddress = searchParams.get("wallet");

		if (!walletAddress) {
			return NextResponse.json(formatErrorResponse(null, "Wallet address is required"), { status: 400 });
		}

		// Validate wallet address
		if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
			return NextResponse.json(formatErrorResponse(null, "Invalid wallet address format"), { status: 400 });
		}

		// Get user's NFT claims from database
		const claims = await getUserNFTClaims(walletAddress);

		// Format activity data with block explorer links
		const activity = claims.map((claim: any) => ({
			id: claim.id,
			type: claim.nft_type,
			tokenId: claim.token_id,
			transactionHash: claim.transaction_hash,
			productId: claim.product_id,
			voucherCode: claim.voucher_code,
			claimedAt: claim.claimed_at,
			explorerUrl: claim.transaction_hash ? `${chain.blockExplorers?.[0]?.url}/tx/${claim.transaction_hash}` : null,
			status: "completed",
		}));

		return NextResponse.json(
			formatSuccessResponse({
				walletAddress,
				totalActivities: activity.length,
				activity,
			})
		);
	} catch (error) {
		console.error("Activity fetch error:", error);
		return NextResponse.json(formatErrorResponse(error, "Failed to fetch activity"), { status: 500 });
	}
}
