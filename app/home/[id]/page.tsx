"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NFTDetail } from "@/components/NFTDetail";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the NFTProduct interface (copied from the marketplace)
interface NFTProduct {
    id: string;
    product_id: string;
    product_name: string;
    description: string;
    nft_type: "free" | "voucher" | "paid";
    token_id: number;
    price_eth?: string;
    max_supply: number;
    current_supply: number;
    is_active: boolean;
    image_url?: string;
    contract_address: string;
    metadata?: any;
}

export default function NFTDetailPage() {
    const router = useRouter();
    const params = useParams();
    // Safely cast params.id to string
    const nftId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [product, setProduct] = useState<NFTProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch the product by ID
    const fetchProduct = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all products first (as your API /api/products returns a list)
            const response = await fetch("/api/products");
            const data = await response.json();

            if (data.success && data.data.products) {
                const foundProduct = data.data.products.find(
                    (p: NFTProduct) => p.id === id
                );
                if (foundProduct) {
                    setProduct(foundProduct);
                } else {
                    setError("NFT not found.");
                }
            } else {
                throw new Error(data.message || "Failed to load products from API.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load NFT details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (nftId) {
            fetchProduct(nftId);
        }
    }, [nftId]);

    // --- Loading and Error States ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="max-w-md mx-auto text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Error</h3>
                    <p className="text-muted-foreground mb-4">{error || "The selected NFT could not be loaded."}</p>
                    <Button onClick={() => router.push('/home')} variant="outline">
                        Go Back to Marketplace
                    </Button>
                </div>
            </div>
        );
    }

    // --- Success State: Render the Detail Component ---
    return (
        <NFTDetail
            product={product}
            onBack={() => router.push("/home")}
        />
    );
}