/*
 * PATH: backend/src/routes/auth.routes.ts
 * This file defines the API routes for authentication (login, logout, etc.).
 */

import { Router } from "express";
import { login, logout, getMe } from "../controllers/auth.controller";
import { checkAuth } from "../middleware/auth.middleware";

const router = Router();

// Route for user login
router.post("/login", login);

// Route for user logout (requires a valid token to know who to log out)
router.post("/logout", checkAuth, logout);

// Route to get the current user's profile (requires a valid token)
router.get("/me", checkAuth, getMe);

export default router;
