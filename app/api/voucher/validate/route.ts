import { NextRequest, NextResponse } from "next/server";
import { VoucherValidationSchema } from "@/lib/types/validation";
import { supabaseAdmin } from "@/lib/database/supabase";
import { formatErrorResponse, formatSuccessResponse } from "@/lib/utils/helpers";

export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validatedData = VoucherValidationSchema.parse(body);
		const { voucherCode } = validatedData;

		// Check if voucher exists
		const { data: voucher, error: voucherError } = await supabaseAdmin.from("voucher_codes").select("*").eq("code", voucherCode).single();

		if (voucherError || !voucher) {
			return NextResponse.json(formatErrorResponse(null, "Voucher code not found"), { status: 404 });
		}

		// Check if voucher is already used
		if ((voucher as any).is_used) {
			return NextResponse.json(formatErrorResponse(null, "Voucher code has already been used"), { status: 400 });
		}

		// Return voucher details
		return NextResponse.json(
			formatSuccessResponse(
				{
					code: (voucher as any).code,
					product_id: (voucher as any).product_id,
					valid: true,
					created_at: (voucher as any).created_at,
				},
				"Voucher code is valid"
			)
		);
	} catch (error) {
		console.error("Voucher validation error:", error);

		if (error instanceof Error && error.message.includes("ZodError")) {
			return NextResponse.json(formatErrorResponse(error, "Invalid request data"), { status: 400 });
		}

		return NextResponse.json(formatErrorResponse(error, "Failed to validate voucher"), { status: 500 });
	}
}
