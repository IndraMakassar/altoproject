import { NextRequest, NextResponse } from "next/server";
import { balanceOf } from "thirdweb/extensions/erc1155";
import { getFreeNFTContract, getVoucherNFTContract, getPaidNFTContract } from "@/lib/contracts/thirdweb";
import { getUserNFTClaims, formatErrorResponse, formatSuccessResponse } from "@/lib/utils/helpers";

export async function GET(request: NextRequest, { params }: { params: Promise<{ address: string }> }) {
	try {
		const { address } = await params;

		// Validate wallet address format
		if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
			return NextResponse.json(formatErrorResponse(null, "Invalid wallet address format"), { status: 400 });
		}

		// Get contracts
		const freeContract = getFreeNFTContract();
		const voucherContract = getVoucherNFTContract();
		const paidContract = getPaidNFTContract();

		// Check balances for each NFT tier
		const [freeBalance, voucherBalance, paidBalance] = await Promise.all([
			balanceOf({
				contract: freeContract,
				owner: address,
				tokenId: BigInt(0), // Free NFT token ID
			}).catch(() => BigInt(0)),
			balanceOf({
				contract: voucherContract,
				owner: address,
				tokenId: BigInt(1), // Voucher NFT token ID
			}).catch(() => BigInt(0)),
			balanceOf({
				contract: paidContract,
				owner: address,
				tokenId: BigInt(2), // Paid NFT token ID
			}).catch(() => BigInt(0)),
		]);

		// Get user's claim history from database
		const claimHistory = await getUserNFTClaims(address);

		// Format NFT collection data
		const collection = [
			{
				tier: "free",
				tokenId: 0,
				balance: Number(freeBalance),
				contractAddress: freeContract.address,
				name: "Fashion NFT - Free Tier",
				description: "Claimed via NFC scan in physical store",
				claimed: Number(freeBalance) > 0,
			},
			{
				tier: "voucher",
				tokenId: 1,
				balance: Number(voucherBalance),
				contractAddress: voucherContract.address,
				name: "Fashion NFT - Voucher Tier",
				description: "Claimed via voucher code from physical purchase",
				claimed: Number(voucherBalance) > 0,
			},
			{
				tier: "paid",
				tokenId: 2,
				balance: Number(paidBalance),
				contractAddress: paidContract.address,
				name: "Fashion NFT - Premium Tier",
				description: "Purchased NFT with exclusive benefits",
				claimed: Number(paidBalance) > 0,
			},
		].filter((nft) => nft.claimed); // Only return NFTs that user owns

		return NextResponse.json(
			formatSuccessResponse({
				walletAddress: address,
				totalNFTs: collection.length,
				collection,
				claimHistory,
			})
		);
	} catch (error) {
		console.error("Collection fetch error:", error);
		return NextResponse.json(formatErrorResponse(error, "Failed to fetch NFT collection"), { status: 500 });
	}
}
