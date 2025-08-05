/*
 * PATH: backend/src/config/supabaseClient.ts
 * This file configures and exports the Supabase client.
 * It uses environment variables for the Supabase URL and the secret service_role key.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY as string;

// Create and export the singleton Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey);
