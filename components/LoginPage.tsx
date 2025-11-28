"use client";

import {ConnectEmbed} from "thirdweb/react";
import {chain, client, wallets} from "@/lib/thirdweb";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import {Button} from "@/components/ui/button";

// The full, constant URL string
const BACKGROUND_IMAGE_URL = "https://images.unsplash.com/photo-1700166066130-646fd42f83a9?fit=max&q=80&w=1080";

export function LoginPage() {
    const router = useRouter();

    return (
        <div className="flex h-screen">
            {/* 1. Left side - Dedicated Image Panel (Desktop Only) */}
            <div className="hidden md:w-1/2 relative overflow-hidden md:flex">
                <Image
                    src={BACKGROUND_IMAGE_URL}
                    alt={"Modern geometric background"}
                    className={"w-full h-full object-cover"}
                    fill
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"/>
            </div>

            {/* 2. Right side - Thirdweb Login Panel */}
            <div className={`
                w-full md:w-1/2 flex flex-col justify-center items-center
                bg-cover bg-center 
                
                [background-image:url('https://images.unsplash.com/photo-1700166066130-646fd42f83a9?fit=max&q=80&w=1080')]

                md:bg-background md:bg-none
            `}>

                {/* Overlay to ensure the text is readable on mobile background */}
                <div className="
                    w-full max-w-lg p-8 rounded-2xl
                    bg-white/80 backdrop-blur-sm
                    md:bg-card md:backdrop-blur-none
                ">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        {/* 🚀 Changed: Use Next.js Image component for your logo */}
                        <Image
                            src={"/Voyage Logo.png"}
                            alt="Voyage Logo"
                            width={213} // Set appropriate width for the logo container (w-16)
                            height={64} // Set appropriate height for the logo container (h-16)
                            className="rounded-full mx-auto mb-4 object-contain" // Keep object-contain for logos
                            priority // High priority as it's a key part of the initial view
                        />
                        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-muted-foreground">Sign in to claim your NFT</p>
                    </div>

                    {/* Sign in Card - Connect Embed is now inside the overlay div */}
                    <div>
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
                            wallets={wallets}
                            theme="light"
                            style={{
                                width: "100%",
                            }}
                        />
                    </div>

                    {/* --- Divider and Guest Option --- */}
                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-border/50"></div>
                        <span className="flex-shrink mx-4 text-sm text-muted-foreground">OR</span>
                        <div className="flex-grow border-t border-border/50"></div>
                    </div>

                    {/* 🚀 New "Continue as Guest" Button */}
                    <Button
                        onClick={() => {
                            router.push("/home")
                        }}
                        className="w-full rounded-lg text-sm font-medium transition-colors
                                   border border-secondary-border shadow-sm"
                    >
                        Continue as Guest
                    </Button>

                </div>
            </div>
        </div>
    );
}