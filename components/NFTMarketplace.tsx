"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CreditCard,
    Gift,
    Key,
    Loader2,
    AlertCircle,
    Package,
    ShoppingCart,
} from "lucide-react";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client, chain } from "@/lib/thirdweb";

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

interface NFTMarketplaceProps {
    onSelectNFT?: (nft: NFTProduct) => void;
}

export default function NFTMarketplace({ onSelectNFT }: NFTMarketplaceProps) {
    const [products, setProducts] = useState<NFTProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<
        "all" | "free" | "voucher" | "paid"
    >("all");

    const account = useActiveAccount();
    const walletAddress = account?.address;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/products");
            const data = await response.json();

            if (data.success) {
                setProducts(data.data.products || []);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load NFT products"
            );
        } finally {
            setLoading(false);
        }
    };

    const tierInfo = {
        free: {
            icon: Gift,
            gradient: "from-green-500 to-emerald-500",
            badge: "default" as const,
            text: "Claim Free",
        },
        voucher: {
            icon: Key,
            gradient: "from-blue-500 to-cyan-500",
            badge: "secondary" as const,
            text: "Redeem Code",
        },
        paid: {
            icon: CreditCard,
            gradient: "from-purple-500 to-pink-500",
            badge: "destructive" as const,
            text: "Purchase Now",
        },
    };

    const filtered = products.filter((p) =>
        filterType === "all" ? p.is_active : p.nft_type === filterType
    );

    const handleAction = (product: NFTProduct) => {
        if (!walletAddress) return alert("Please connect your wallet first");
        if (onSelectNFT) onSelectNFT(product);
    };

    const price = (p: NFTProduct) =>
        p.nft_type === "free"
            ? "FREE"
            : p.nft_type === "voucher"
                ? "CODE REQUIRED"
                : p.price_eth
                    ? `${p.price_eth} ETH`
                    : "TBD";

    const supplyLeft = (p: NFTProduct) => p.max_supply - p.current_supply;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border p-4 sticky top-0 bg-background/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">NFT</span>
                        </div>
                        <span className="font-bold text-xl">Marketplace</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <ConnectButton
                            client={client}
                            chain={chain}
                            connectButton={{
                                label: "Connect Wallet",
                                className: "!text-sm",
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto p-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Exclusive NFT Collection
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Discover and collect digital assets on the Base blockchain
                    </p>
                </div>

                {/* Filters */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex rounded-lg border border-border p-1 bg-muted/50">
                        {["all", "free", "voucher", "paid"].map((t) => {
                            const label =
                                t === "all"
                                    ? "All NFTs"
                                    : t === "free"
                                        ? "Free"
                                        : t === "voucher"
                                            ? "Voucher"
                                            : "Premium";
                            const Icon =
                                t !== "all" ? tierInfo[t as keyof typeof tierInfo].icon : null;

                            return (
                                <Button
                                    key={t}
                                    variant={filterType === t ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setFilterType(t as any)}
                                    className="flex items-center gap-2"
                                >
                                    {Icon && <Icon className="w-4 h-4" />} {label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="py-20 text-center">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
                        <p className="text-muted-foreground">Loading NFT collection...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="max-w-md mx-auto">
                        <Card className="border-red-500/20 bg-red-500/10">
                            <CardContent className="pt-6 text-center">
                                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    Failed to Load Products
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                                <Button onClick={fetchProducts} variant="outline">
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && (
                    <div>
                        {filtered.length === 0 ? (
                            <div className="py-20 text-center">
                                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No NFTs Available</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filtered.map((p) => {
                                    const T = tierInfo[p.nft_type];
                                    const Available = supplyLeft(p);

                                    return (
                                        <Card
                                            key={p.id}
                                            className="group relative overflow-hidden hover:shadow-xl transition-all duration-300"
                                        >
                                            {/* Background gradient */}
                                            <div
                                                className={`absolute inset-0 bg-gradient-to-br ${T.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
                                            />

                                            <div className="relative h-64 bg-muted overflow-hidden">
                                                {p.image_url ? (
                                                    <Image
                                                        src={p.image_url}
                                                        alt={p.product_name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400/20 to-blue-400/20">
                                                        <T.icon className="w-20 h-20 text-muted-foreground/40" />
                                                    </div>
                                                )}

                                                {/* Supply */}
                                                <div className="absolute top-4 right-4">
                                                    {Available > 0 ? (
                                                        <Badge variant="secondary">
                                                            {Available} left
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Sold Out</Badge>
                                                    )}
                                                </div>

                                                {/* Tier */}
                                                <div className="absolute top-4 left-4">
                                                    <Badge variant={T.badge}>
                                                        {p.nft_type.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <CardHeader>
                                                <CardTitle>{p.product_name}</CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {p.description}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-2xl font-bold">{price(p)}</span>
                                                    <span className="text-muted-foreground text-sm">
                            Token #{p.token_id}
                          </span>
                                                </div>

                                                <Button
                                                    className="w-full"
                                                    disabled={Available <= 0}
                                                    variant={p.nft_type === "free" ? "default" : "outline"}
                                                    onClick={() => handleAction(p)}
                                                >
                                                    {Available > 0 ? T.text : "Sold Out"}
                                                </Button>

                                                <p className="mt-3 text-xs text-muted-foreground text-right">
                                                    Supply: {p.current_supply}/{p.max_supply}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
