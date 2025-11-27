import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Disable strict mode for better compatibility with Web3 libraries
	reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
        ],
    },
};

export default nextConfig;
