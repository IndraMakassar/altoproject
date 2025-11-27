import { NextResponse } from "next/server";
import productsData from "@/data/products.json";

export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            data: productsData,
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to load products" },
            { status: 500 }
        );
    }
}

