import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Runtime validation - only warn if vars are missing during development
if (process.env.NODE_ENV === "development") {
	if (!supabaseUrl) {
		console.warn("Warning: SUPABASE_URL environment variable not set");
	}

	if (!supabaseAnonKey) {
		console.warn("Warning: SUPABASE_ANON_KEY environment variable not set");
	}
}

// Public client for client-side operations
export const supabase = createClient<Database>(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-key");

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient<Database>(supabaseUrl || "https://placeholder.supabase.co", supabaseServiceRoleKey || supabaseAnonKey || "placeholder-key", {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});
