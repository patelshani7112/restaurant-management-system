/* =================================================================
 * PATH: mobile-app/src/api/axiosClient.ts
 * ================================================================= */
import axios from "axios";
import { supabase } from "../lib/supabaseClient";

// IMPORTANT: Replace with your computer's local IP address.
// Find this by typing `ipconfig` (Windows) or `ifconfig` (Mac) in your terminal.
const API_BASE_URL = "http://192.168.2.33:8080/api/v1";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

axiosClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
