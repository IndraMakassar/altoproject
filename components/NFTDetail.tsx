"use client";

import React, {useState} from "react";
import {Button} from "./ui/button";
import {Badge} from "./ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "./ui/card";
import {Input} from "./ui/input";
import {Label} from "./ui/label";
import {ArrowLeft, CheckCircle, ExternalLink, Loader2, Shield, Users, XCircle,} from "lucide-react";
import {ConnectButton, MediaRenderer, useActiveAccount, useReadContract, useSendTransaction,} from "thirdweb/react";
import {chain, client, wallets} from "@/lib/thirdweb";
import {getContract, PreparedTransaction,} from "thirdweb";
import {claimTo, getActiveClaimCondition, getNFT,} from "thirdweb/extensions/erc1155";
import {Product, useProducts} from "@/hooks/useProducts";

interface NFTDetailPageProps {
    product: Product;
    onBack: () => void;
}

export function NFTDetail({product, onBack}: NFTDetailPageProps) {
    const account = useActiveAccount();
    const walletAddress = account?.address;

    const { refetch: refetchProducts } = useProducts();

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<
        "idle" | "success" | "error" | "claiming"
    >("idle");
    const [message, setMessage] = useState('');

    const contract = getContract({
        client,
        chain,
        address: product.contract_address,
    });

    // Convert BigInt for use in read hooks
    const tokenIdBigInt = BigInt(product.token_id);

    // V5 Hook: Read NFT Metadata
    const {data: nftMetadata, isLoading: isLoadingMetadata} = useReadContract(
        getNFT,
        {
            contract,
            tokenId: tokenIdBigInt,
        }
    );

    // V5 Hook: Read Active Claim Condition (contains the limits and prices)
    const {data: activeClaimCondition} = useReadContract(
        getActiveClaimCondition,
        {
            contract,
            tokenId: tokenIdBigInt,
            // The claimer address is required to calculate the max claimable amount
        }
    );

    // V5 Hook: useSendTransaction for writing to the contract
    const {mutateAsync: sendTransaction} = useSendTransaction();

    // --- Derived State for Claim Logic ---
    const claimedByWallet = activeClaimCondition?.supplyClaimed || 0n;
    const maxClaimablePerWallet = activeClaimCondition?.quantityLimitPerWallet || 0n;
    const isSoldOut = product.current_supply - product.max_supply <= 0;

    // Determine if the user has already claimed the maximum allowed
    // Note: maxClaimablePerWallet is 0n if there is no wallet limit set.
    const hasExceededLimit = maxClaimablePerWallet > 0n && claimedByWallet >= maxClaimablePerWallet;

    const getPrice = () => {
        const price = product.price_eth ? parseFloat(product.price_eth) : 0;
        switch (product.nft_type) {
            case "free":
                return "FREE";
            case "voucher":
                return "CODE REQUIRED";
            case "paid":
                return `${price} ETH`;
            default:
                return "TBD";
        }
    };

    // --- Thirdweb Claim/Purchase Logic (V5) ---
    const handleClaim = async () => {
        if (!walletAddress) {
            alert("Please connect your wallet first.");
            return;
        }
        if (hasExceededLimit) {
            alert("Claim failed: You have already claimed the maximum allowed for this NFT.");
            return;
        }

        setLoading(true);
        setStatus("claiming");
        setMessage("");

        try {
            let transaction: PreparedTransaction;
            const quantity = 1n; // Claiming one NFT

            if (product.nft_type === "voucher") {
                if (!code) throw new Error("Voucher code is required.");

                setMessage(`Voucher code processed. Waiting for API confirmation...`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API work

                // ERC-1155 Claim (Voucher/Allowlist logic needs to be integrated with your backend)
                // For a fallback simple claim:
                transaction = claimTo({
                    contract,
                    to: walletAddress,
                    tokenId: tokenIdBigInt, // <-- ADDED for ERC-1155
                    quantity,
                });

            } else {
                // Free or Paid Claim

                transaction = claimTo({
                    contract,
                    to: walletAddress,
                    tokenId: tokenIdBigInt, // <-- ADDED for ERC-1155
                    quantity,
                });
            }

            // V5 Execution: Use useSendTransaction hook's mutateAsync
            const txResult = await sendTransaction(transaction);

            setStatus("success");
            setMessage(`Transaction successful! Hash: ${txResult.transactionHash.slice(0, 10)}...`);

            await refetchProducts();

        } catch (error) {
            console.error("Claim failed:", error);
            setStatus("error");

            let friendlyMessage = "An unknown error occurred during claim.";

            // Specific error check
            if (error instanceof Error && error.message.includes("DropClaimExceedLimit")) {
                friendlyMessage = "Claim Limit Exceeded: You have already claimed the maximum allowed for this NFT.";
            } else {
                friendlyMessage = error instanceof Error ? `Claim failed: ${error.message}` : friendlyMessage;
            }

            setMessage(friendlyMessage);

        } finally {
            setLoading(false);
        }
    };

    const properties = nftMetadata?.metadata.attributes || product.metadata?.attributes || [];
    const imageUrl = nftMetadata?.metadata.image || product.image_url;
    const currentSupply = product.current_supply;
    const maxSupply = product.max_supply;
    const available = maxSupply - currentSupply;

    const tierInfo = {
        free: {badge: "default" as const, text: "Claim for Free"},
        voucher: {badge: "secondary" as const, text: "Redeem Code"},
        paid: {badge: "destructive" as const, text: "Purchase NFT"},
    };
    const T = tierInfo[product.nft_type];

    // Status Notification Component
    const StatusNotification = () => {
        if (status === "idle") return null;

        const icon =
            status === "claiming" ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary"/>
            ) : status === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-500"/>
            ) : (
                <XCircle className="w-5 h-5 text-red-500"/>
            );

        const cardClass =
            status === "success"
                ? "border-green-500/50 bg-green-500/10"
                : status === "error"
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-primary/50 bg-primary/10";

        return (
            <Card className={`mb-6 ${cardClass}`}>
                <CardContent className="flex items-center space-x-3 pt-6">
                    {icon}
                    <p className="text-sm font-medium">
                        {/* Only show the custom message */}
                        {status === "claiming" ? "Transaction in progress (waiting for wallet)..." : message}
                    </p>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border p-3 sm:p-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">

                    {/* Back Button (shortened on mobile) */}
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="flex items-center space-x-2 text-sm whitespace-nowrap"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Marketplace</span>
                        <span className="sm:hidden">Back</span>
                    </Button>

                    {/* Login Button */}
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
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left side - NFT Image and Properties (Unchanged) */}
                    <div className="space-y-6">
                        <div className="aspect-square relative overflow-hidden rounded-xl bg-muted">
                            {imageUrl ? (
                                <MediaRenderer
                                    client={client}
                                    src={imageUrl}
                                    alt={product.product_name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-muted-foreground">No Image Available</p>
                                </div>
                            )}

                            <div className="absolute top-4 left-4">
                                {isSoldOut ? (
                                    <Badge variant="destructive" className="bg-red-600 text-white">
                                        Sold Out
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-white/90 text-black">
                                        {available} available
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Properties</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoadingMetadata ? (
                                    <div className="flex justify-center p-4">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary"/>
                                    </div>
                                ) : properties.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {properties.map((prop: any, index: number) => (
                                            <div
                                                key={index}
                                                className="bg-muted/50 rounded-lg p-3 text-center"
                                            >
                                                <div className="text-sm text-muted-foreground line-clamp-1">
                                                    {prop.trait_type}
                                                </div>
                                                <div className="font-semibold line-clamp-1">
                                                    {prop.value}
                                                </div>
                                                {prop.trait_type.toLowerCase() === 'available' && (
                                                    <div className="text-xs text-blue-500">
                                                        {prop.value}% Rarity
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No properties found in metadata.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right side - NFT Details and Action */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">
                                {product.metadata?.name || product.product_name} Collection
                            </p>
                            <h1 className="text-4xl font-bold mb-4">
                                {product.product_name}
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                {product.description || nftMetadata?.metadata.description || "Exclusive digital collectible"}
                            </p>

                            <div className="flex items-center space-x-4 mb-6">
                                <div className="flex items-center space-x-2">
                                    <Users className="w-4 h-4 text-muted-foreground"/>
                                    <span className="text-sm">
                                        Created by {product.metadata?.creator || "Voyage"}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-4 h-4 text-muted-foreground"/>
                                    <span className="text-sm">
                                        Polygon
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price and Action */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Price</CardTitle>
                                        <CardDescription>
                                            {product.nft_type === "paid"
                                                ? "Current price"
                                                : product.nft_type === "free"
                                                    ? "No gas fee required"
                                                    : "Redemption required"}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                            {getPrice()}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Status Notification */}
                                <StatusNotification/>

                                {product.nft_type === "voucher" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Redeem Code</Label>
                                        <Input
                                            id="code"
                                            placeholder="Enter your voucher code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                {!walletAddress && (
                                    <ConnectButton
                                        client={client}
                                        chain={chain}
                                        wallets={wallets}
                                        theme={"light"}
                                        connectButton={{
                                            label: "Login to Claim",
                                            className: "w-full !text-base",
                                        }}
                                    />
                                )}

                                {walletAddress && (
                                    <Button
                                        onClick={handleClaim}
                                        className="w-full"
                                        variant={"default"}
                                        disabled={
                                            status === "claiming" || // This disables the button and applies opacity-50 style
                                            isSoldOut ||
                                            hasExceededLimit ||
                                            (product.nft_type === "voucher" && !code)
                                        }
                                    >
                                        {isSoldOut ? (
                                            "Sold Out"
                                        ) : hasExceededLimit ? (
                                            "Claim Limit Reached"
                                        ) : (
                                            // Always show the standard call to action text (T.text)
                                            // The disabled prop handles the visual state when claiming.
                                            T.text
                                        )}
                                    </Button>
                                )}

                                {product.nft_type === "paid" && (
                                    <p className="text-xs text-muted-foreground text-center">
                                        By {T.text.toLowerCase()}, you agree to our terms.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Details (Unchanged) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Contract Address</span>
                                    <a
                                        href={`${chain.blockExplorers?.[0]?.url}/address/${product.contract_address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 hover:text-primary transition-colors"
                                    >
                                        <span className="font-mono text-sm">
                                            {product.contract_address.slice(0, 6)}...
                                            {product.contract_address.slice(-4)}
                                        </span>
                                        <ExternalLink className="w-4 h-4"/>
                                    </a>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Token ID</span>
                                    <span>{product.token_id.toString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Supply</span>
                                    <span>
                                        {currentSupply}/{maxSupply}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Blockchain</span>
                                    <span>Polygon</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}