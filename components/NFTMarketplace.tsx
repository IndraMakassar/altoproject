"use client";

import React, {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {AlertCircle, CreditCard, Gift, Key, Loader2, Package} from "lucide-react";
import {ConnectButton, MediaRenderer, useActiveAccount} from "thirdweb/react";
import {chain, client, wallets} from "@/lib/thirdweb";
import {Product, useProducts} from "@/hooks/useProducts";
import Image from "next/image";

interface NFTMarketplaceProps {
    onSelectNFT?: (nft: Product) => void;
}

export default function NFTMarketplace({onSelectNFT}: NFTMarketplaceProps) {
    const { data: products = [], isLoading: loading, error: error, refetch } = useProducts();

    const [filterType, setFilterType] = useState<"all" | "free" | "voucher" | "paid">("all");

    // V5 Hook: useActiveAccount to get the wallet status

    const tierInfo = {
        free: {
            icon: Gift,
            gradient: "from-green-500 to-emerald-500",
            badge: "default" as const,
            text: "Claim Free",
            bgOpacity: "bg-green-500/10",
        },
        voucher: {
            icon: Key,
            gradient: "from-blue-500 to-cyan-500",
            badge: "secondary" as const,
            text: "Redeem Code",
            bgOpacity: "bg-blue-500/10",
        },
        paid: {
            icon: CreditCard,
            gradient: "from-purple-500 to-pink-500",
            badge: "destructive" as const,
            text: "Purchase Now",
            bgOpacity: "bg-purple-500/10",
        },
    };

    const filtered = products.filter((p) =>
        filterType === "all" ? true : p.nft_type === filterType
        // filterType === "all" ? p.is_active : p.nft_type === filterType && p.is_active
    );

    const handleAction = (product: Product) => {
        if (onSelectNFT) onSelectNFT(product);
    };

    const getPrice = (p: Product) =>
        p.nft_type === "free"
            ? "FREE"
            : p.nft_type === "voucher"
                ? "CODE REQUIRED"
                : p.price_eth
                    ? `${p.price_eth} ETH`
                    : "TBD";

    return (
        <div className="min-h-screen bg-background">
            {/* ... (Header and filters remain the same) ... */}
            <header className="border-b border-border p-3 sm:p-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur z-50">
                <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-3 flex-wrap">

                    {/* Logo */}
                    <div className="flex items-center">
                        <Image
                            src="/Voyage Logo.png"
                            alt="Voyage Logo"
                            width={140}
                            height={40}
                            className="object-contain w-32 xs:w-40 sm:w-48"
                            priority
                        />
                    </div>

                    {/* Login button */}
                    <div className="flex justify-end">
                        <ConnectButton
                            client={client}
                            chain={chain}
                            wallets={wallets}
                            theme="light"
                            connectButton={{
                                label: "Login",
                                className: "!text-sm",
                            }}
                        />
                    </div>

                </div>
            </header>


            <main className="max-w-7xl mx-auto p-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                        Exclusive NFT Collection
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Discover and collect unique digital assets on Polygon
                    </p>
                </div>

                {/* Filters */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex rounded-lg border border-border p-1 bg-muted/50">
                        {(["all", "free", "voucher", "paid"] as const).map((t) => {
                            const label =
                                t === "all"
                                    ? "All NFTs"
                                    : t === "free"
                                        ? "Free"
                                        : t === "voucher"
                                            ? "Voucher"
                                            : "Premium";
                            const Icon = t !== "all" ? tierInfo[t].icon : Package;

                            return (
                                <Button
                                    key={t}
                                    variant={filterType === t ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setFilterType(t)}
                                    className="flex items-center gap-2"
                                >
                                    <Icon className="w-4 h-4"/> {label}
                                </Button>
                            );
                        })}
                    </div>
                </div>


                {/* Loading, Error, and Grid logic remains the same */}
                {loading && (
                    <div className="py-20 text-center">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500"/>
                        <p className="text-muted-foreground">Loading NFT collection...</p>
                    </div>
                )}

                {error && (
                    <div className="max-w-md mx-auto">
                        <Card className="border-red-500/20 bg-red-500/10">
                            <CardContent className="pt-6 text-center">
                                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4"/>
                                <h3 className="text-lg font-semibold mb-2">Failed to Load Products</h3>
                                <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
                                <Button onClick={() => refetch()} variant="outline">
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {!loading && !error && (
                    <div>
                        {filtered.length === 0 ? (
                            <div className="py-20 text-center">
                                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
                                <h3 className="text-xl font-semibold mb-2">No NFTs Available</h3>
                                <p className="text-muted-foreground">
                                    {filterType === "all"
                                        ? "No NFTs in the collection yet"
                                        : `No ${filterType} NFTs available`}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filtered.map((p) => {
                                    const T = tierInfo[p.nft_type];
                                    const available = p.current_supply - p.max_supply;
                                    const isSoldOut = available <= 0;

                                    return (
                                        <Card
                                            key={p.id}
                                            className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                                            onClick={() => handleAction(p)}
                                        >
                                            {/* Background gradient */}
                                            <div
                                                className={`absolute inset-0 bg-gradient-to-br ${T.gradient} opacity-0 group-hover:opacity-20 transition-opacity`}
                                            />

                                            <div className="relative h-64 bg-muted overflow-hidden">
                                                {p.image_url ? (
                                                    <MediaRenderer
                                                        client={client}
                                                        src={p.image_url}
                                                        alt={p.product_name}
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className={`w-full h-full flex items-center justify-center ${T.bgOpacity}`}>
                                                        <T.icon className="w-20 h-20 text-muted-foreground/40"/>
                                                    </div>
                                                )}

                                                {/* Overlay on hover */}
                                                <div
                                                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"/>

                                                {/* Supply Badge */}
                                                <div className="absolute top-4 right-4">
                                                    {isSoldOut ? (
                                                        <Badge variant="destructive" className="shadow-lg">
                                                            Sold Out
                                                        </Badge>
                                                    ) : available <= 10 ? (
                                                        <Badge variant="secondary"
                                                               className="shadow-lg bg-orange-500 text-white">
                                                            {available} left
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="shadow-lg">
                                                            {available} available
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Type Badge */}
                                                <div className="absolute top-4 left-4">
                                                    <Badge variant={T.badge} className="shadow-lg">
                                                        <T.icon className="w-3 h-3 mr-1"/>
                                                        {p.nft_type.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <CardHeader>
                                                <CardTitle className="group-hover:text-primary transition-colors">
                                                    {p.product_name}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {p.description || "Exclusive digital collectible"}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span
                                                        className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                                        {getPrice(p)}
                                                    </span>
                                                    <span className="text-muted-foreground text-sm">
                                                        Token #{p.token_id}
                                                    </span>
                                                </div>

                                                <Button
                                                    className="w-full group-hover:scale-105 transition-transform"
                                                    disabled={isSoldOut}
                                                    variant={isSoldOut ? "secondary" : "default"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAction(p);
                                                    }}
                                                >
                                                    {isSoldOut ? "Sold Out" : T.text}
                                                </Button>

                                                <div
                                                    className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>Supply: {p.max_supply}/{p.current_supply}</span>
                                                    {p.contract_address && (
                                                        <span className="font-mono">
                                                            {p.contract_address.slice(0, 6)}...{p.contract_address.slice(-4)}
                                                        </span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border mt-20 py-8">
                <div className="max-w-7xl mx-auto px-8 text-center text-sm text-muted-foreground">
                    <p>Powered by Thirdweb • {chain.name}</p>
                </div>
            </footer>
        </div>
    );
}