"use client";

import {ConnectEmbed} from "thirdweb/react";
import {chain, client} from "@/lib/thirdweb";
import Image from "next/image";

export function LoginPage() {
    return (
        <div className="flex h-screen">
            {/* Left side - Image */}
            <div className="w-1/2 relative overflow-hidden">
                <Image
                    src={"https://images.unsplash.com/photo-1700166066130-646fd42f83a9?fit=max&q=80&w=1080"}
                    alt={"Modern geometric background"}
                    className={"w-full h-full object-cover"}
                    fill
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"/>
            </div>

            {/* Right side - Thirdweb Login */}
            <div className="w-1/2 flex flex-col justify-center items-center p-8 bg-background">
                <div className="w-full max-w-lg">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div
                            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">NFT</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-muted-foreground">Sign in to claim your NFT</p>
                    </div>

                    {/* Sign in Card */}
                    <div className="border border-border rounded-2xl p-8 bg-card shadow-sm">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-semibold text-foreground">Connect Wallet</h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Choose your preferred method to continue
                            </p>
                        </div>

                        {/* Thirdweb Connect Embed */}
                        <ConnectEmbed
                            client={client}
                            chain={chain}
                            theme="light"
                            style={{
                                width: "100%",
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
