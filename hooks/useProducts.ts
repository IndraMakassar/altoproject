"use client";

import { useQuery } from "@tanstack/react-query";

export interface Product {
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

async function fetchProducts(): Promise<Product[]> {
    const response = await fetch("/api/products");

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    const json = await response.json();
    return json.data.products;
}

export function useProducts() {
    return useQuery({
        queryKey: ["products"], // Cache key
        queryFn: fetchProducts,
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: false, // Don't refetch when user returns to tab
        refetchOnMount: false, // Don't refetch on component mount if data exists
    });
}