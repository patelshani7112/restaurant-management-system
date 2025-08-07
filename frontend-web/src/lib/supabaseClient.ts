/* =================================================================
 * PATH: frontend-web/src/services/supabaseClient.ts
 * This file initializes and exports the Supabase client for the frontend.
 * ================================================================= */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // These options are true by default, but we're being explicit
    // to ensure the client automatically handles refreshing the token.
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
