"use client";

import { useRouter } from "next/navigation";
import NFTMarketplace from "@/components/NFTMarketplace";

export default function HomePage() {
    const router = useRouter();

    return (
        <NFTMarketplace
            onSelectNFT={(nft) => {
                console.log("Clicked NFT:", nft);
                router.push(`/home/${nft.id}`);
            }}
        />
    );
}
