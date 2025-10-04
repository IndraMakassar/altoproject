import { z } from "zod";

// Request validation schemas
export const FreeClaimSchema = z.object({
	nfcTagId: z.string().min(1, "NFC Tag ID is required"),
	userWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
	productId: z.string().uuid("Invalid product ID format"),
});

export const VoucherClaimSchema = z.object({
	voucherCode: z.string().min(6, "Voucher code must be at least 6 characters"),
	userWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
});

export const PaidClaimSchema = z.object({
	userWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
	paymentToken: z.string().min(1, "Payment token is required"),
});

export const EligibilitySchema = z.object({
	userWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
});

export const VoucherValidationSchema = z.object({
	voucherCode: z.string().min(6, "Voucher code must be at least 6 characters"),
});

// Types derived from schemas
export type FreeClaimRequest = z.infer<typeof FreeClaimSchema>;
export type VoucherClaimRequest = z.infer<typeof VoucherClaimSchema>;
export type PaidClaimRequest = z.infer<typeof PaidClaimSchema>;
export type EligibilityRequest = z.infer<typeof EligibilitySchema>;
export type VoucherValidationRequest = z.infer<typeof VoucherValidationSchema>;
