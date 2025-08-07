/* =================================================================
 * PATH: frontend-web/src/api/axiosClient.ts
 * This file now uses the Supabase client to get a fresh, valid
 * token before every API request, solving the session expiry issue.
 * ================================================================= */
import axios from "axios";
import { supabase } from "../lib/supabaseClient"; // Import the Supabase client

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Use an async interceptor to get the latest session token
axiosClient.interceptors.request.use(async (config) => {
  // The Supabase client automatically refreshes the token in the background.
  // This `getSession` call always returns the latest, valid session.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
