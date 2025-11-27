import { NextResponse } from "next/server";
import { getNFTContract } from "@/lib/thirdweb";
import { getNFTs } from "thirdweb/extensions/erc1155";

// Convert BigInt → string
function safeJson(obj: any): any {
    return JSON.parse(
        JSON.stringify(obj, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
        )
    );
}

export async function GET() {
    try {
        const contract = getNFTContract("free");

        // 🎯 use ERC1155 getNFTs
        const nfts = await getNFTs({
            contract,
        });

        console.log(nfts)

        const products = nfts.map((nft) => {
            const supply = Number(nft.supply ?? 0);

            return {
                id: nft.id.toString(),
                product_id: nft.id.toString(),
                product_name: nft.metadata?.name || `NFT #${nft.id}`,
                description: nft.metadata?.description || "",
                nft_type: "free",
                token_id: Number(nft.id),
                price_eth: nft.metadata?.attributes?.find(a => a.trait_type === "price")?.value || "0",

                // Use on-chain supply properly
                max_supply: supply,
                current_supply: 0, // If you want minting later, replace with balanceOf

                is_active: supply > 0, // simple logic

                image_url: nft.metadata?.image ?? null,
                contract_address: nft.tokenAddress,
                metadata: safeJson(nft.metadata),
            };
        });


        return NextResponse.json({
            success: true,
            data: { products },
        });
    } catch (error: any) {
        console.error("API ERROR:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
