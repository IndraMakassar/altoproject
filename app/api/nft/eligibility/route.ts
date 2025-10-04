import { NextRequest, NextResponse } from "next/server";
import { EligibilitySchema } from "@/lib/types/validation";
import { hasUserClaimedNFTType, formatErrorResponse, formatSuccessResponse } from "@/lib/utils/helpers";

export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validatedData = EligibilitySchema.parse(body);
		const { userWallet } = validatedData;

		// Check if user has both free and voucher NFTs
		const [hasFreeNFT, hasVoucherNFT] = await Promise.all([hasUserClaimedNFTType(userWallet, "free"), hasUserClaimedNFTType(userWallet, "voucher")]);

		// Check if user has already claimed paid NFT
		const hasPaidNFT = await hasUserClaimedNFTType(userWallet, "paid");

		const eligible = hasFreeNFT && hasVoucherNFT && !hasPaidNFT;

		let reason = "";
		if (hasPaidNFT) {
			reason = "You have already claimed the paid NFT";
		} else if (!hasFreeNFT) {
			reason = "You must claim the free NFT first";
		} else if (!hasVoucherNFT) {
			reason = "You must claim the voucher NFT first";
		}

		return NextResponse.json(
			formatSuccessResponse({
				eligible,
				reason: eligible ? "You are eligible to purchase the paid NFT" : reason,
				requirements: {
					hasFreeNFT,
					hasVoucherNFT,
				},
			})
		);
	} catch (error) {
		console.error("Eligibility check error:", error);

		if (error instanceof Error && error.message.includes("ZodError")) {
			return NextResponse.json(formatErrorResponse(error, "Invalid request data"), { status: 400 });
		}

		return NextResponse.json(formatErrorResponse(error, "Failed to check eligibility"), { status: 500 });
	}
}
