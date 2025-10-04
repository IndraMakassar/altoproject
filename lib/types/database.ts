// Database types based on Supabase schema
export interface Database {
	public: {
		Tables: {
			users: {
				Row: {
					id: string;
					email?: string;
					google_id?: string;
					phone?: string;
					wallet_address: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					email?: string;
					google_id?: string;
					phone?: string;
					wallet_address: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					google_id?: string;
					phone?: string;
					wallet_address?: string;
					created_at?: string;
				};
			};
			voucher_codes: {
				Row: {
					id: string;
					code: string;
					is_used: boolean;
					used_by?: string;
					used_at?: string;
					product_id?: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					code: string;
					is_used?: boolean;
					used_by?: string;
					used_at?: string;
					product_id?: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					code?: string;
					is_used?: boolean;
					used_by?: string;
					used_at?: string;
					product_id?: string;
					created_at?: string;
				};
			};
			nft_claims: {
				Row: {
					id: string;
					user_id: string;
					nft_type: "free" | "voucher" | "paid";
					token_id?: number;
					transaction_hash?: string;
					product_id?: string;
					voucher_code?: string;
					claimed_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					nft_type: "free" | "voucher" | "paid";
					token_id?: number;
					transaction_hash?: string;
					product_id?: string;
					voucher_code?: string;
					claimed_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					nft_type?: "free" | "voucher" | "paid";
					token_id?: number;
					transaction_hash?: string;
					product_id?: string;
					voucher_code?: string;
					claimed_at?: string;
				};
			};
			nfc_products: {
				Row: {
					id: string;
					product_id: string;
					product_name: string;
					nfc_tag_id: string;
					is_active: boolean;
					max_claims_per_user: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					product_id: string;
					product_name: string;
					nfc_tag_id: string;
					is_active?: boolean;
					max_claims_per_user?: number;
					created_at?: string;
				};
				Update: {
					id?: string;
					product_id?: string;
					product_name?: string;
					nfc_tag_id?: string;
					is_active?: boolean;
					max_claims_per_user?: number;
					created_at?: string;
				};
			};
		};
	};
}

// API Types
export type NFTTier = "free" | "voucher" | "paid";

export interface User {
	id: string;
	email?: string;
	google_id?: string;
	phone?: string;
	wallet_address: string;
	created_at: string;
}

export interface VoucherCode {
	id: string;
	code: string;
	is_used: boolean;
	used_by?: string;
	used_at?: string;
	product_id?: string;
	created_at: string;
}

export interface NFTClaim {
	id: string;
	user_id: string;
	nft_type: NFTTier;
	token_id?: number;
	transaction_hash?: string;
	product_id?: string;
	voucher_code?: string;
	claimed_at: string;
}

export interface NFCProduct {
	id: string;
	product_id: string;
	product_name: string;
	nfc_tag_id: string;
	is_active: boolean;
	max_claims_per_user: number;
	created_at: string;
}

// API Response types
export interface APIResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface ClaimResponse {
	success: boolean;
	transaction_hash?: string;
	token_id?: number;
	message: string;
}

export interface EligibilityResponse {
	eligible: boolean;
	reason?: string;
	requirements?: {
		hasFreeNFT: boolean;
		hasVoucherNFT: boolean;
	};
}
