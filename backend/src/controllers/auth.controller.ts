/*
 * PATH: backend/src/controllers/auth.controller.ts
 * This controller handles all logic related to user authentication.
 * CORRECTED: This version uses a dedicated admin client to bypass RLS
 * during the profile lookup after a successful login.
 */

import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

// We import the standard client for general use
import { supabase } from "../config/supabaseClient";

// Extend the Express Request type to include our user and profile
interface AuthenticatedRequest extends Request {
  user?: any;
  profile?: any;
}

/**
 * Logs a user in using their email and password.
 * @param req Express Request object. Expects { email, password } in the body.
 * @param res Express Response object.
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // 1. Sign in the user with Supabase Auth using the standard client
    const { data: sessionData, error: sessionError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (sessionError) {
      return res.status(401).json({ error: "Invalid login credentials." });
    }

    if (!sessionData.session || !sessionData.user) {
      return res.status(401).json({ error: "Invalid login credentials." });
    }

    // --- THE FIX ---
    // 2. Create a NEW, dedicated admin client that is guaranteed to use the service_role key.
    // This ensures we bypass RLS to fetch the user's profile, which is necessary server-side.
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_KEY as string
    );

    // 3. Fetch the user's profile from our 'profiles' table using the admin client
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", sessionData.user.id)
      .single();

    if (profileError) {
      // If this still fails, it means the profile truly does not exist for that ID.
      return res.status(404).json({
        error: "User authenticated, but profile data could not be found.",
        details: profileError.message,
      });
    }

    // 4. Return the session and profile data
    res.status(200).json({
      message: "Login successful.",
      session: sessionData.session,
      profile: profileData,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      error: "An unexpected error occurred during login.",
      details: error.message,
    });
  }
};

/**
 * Logs out the currently authenticated user.
 * @param req Express Request object. Expects a valid token.
 * @param res Express Response object.
 */
export const logout = async (req: AuthenticatedRequest, res: Response) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return res
      .status(500)
      .json({ error: "Logout failed.", details: error.message });
  }

  res.status(200).json({ message: "Successfully logged out." });
};

/**
 * Retrieves the profile of the currently authenticated user.
 * @param req Express Request object. Expects a valid token.
 * @param res Express Response object.
 */
export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json(req.profile);
};

/**
 * Sends a password reset email to the user.
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  // The redirectTo URL must be whitelisted in your Supabase project settings.
  const redirectTo = "http://localhost:5173/reset-password";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo,
  });

  if (error) {
    console.error("Password reset error:", error);
    // Send a generic success message even if the email doesn't exist
    // to prevent user enumeration attacks.
    return res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  }

  res.status(200).json({
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });
};
