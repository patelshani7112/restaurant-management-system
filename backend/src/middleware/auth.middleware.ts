/* =================================================================
 * PATH: backend/src/middleware/auth.middleware.ts
 * This middleware handles authentication and role-based authorization.
 * UPDATED: This version uses a dedicated admin client to validate tokens,
 * which solves the 401 Unauthorized error after logging out and in again.
 * ================================================================= */
import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

// Extend the Express Request type to include our user and profile
export interface AuthenticatedRequest extends Request {
  user?: any;
  profile?: any;
}

/**
 * Middleware to check for a valid JWT and retrieve user data.
 */
export const checkAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expects "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ error: "Authentication required. No token provided." });
  }

  try {
    // --- THE FIX ---
    // Create a NEW, dedicated admin client for every request.
    // This guarantees it always uses the service_role key and is never
    // affected by a user's session state.
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_KEY as string
    );

    // 1. Verify the token and get the user using the admin client
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
    req.user = user;

    // 2. Get the user's profile using the same admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res
        .status(403)
        .json({ error: "User profile not found or inaccessible." });
    }
    req.profile = profile;

    next(); // If everything is okay, proceed
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An unexpected error occurred during authentication." });
  }
};

/**
 * Middleware factory to check if the user has one of the allowed roles.
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.profile || !allowedRoles.includes(req.profile.role_name)) {
      return res.status(403).json({
        error: "Forbidden. You do not have the required permissions.",
      });
    }
    next(); // User has the required role, proceed.
  };
};
