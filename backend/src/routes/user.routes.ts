/*
 * PATH: backend/src/routes/user.routes.ts
 * This file defines the API routes for user management (CRUD).
 */

import { Router } from "express";
// 1. Import all the necessary controller functions
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import { checkAuth, checkRole } from "../middleware/auth.middleware";

const router = Router();

// CREATE a new user (Only Admins)
router.post("/", checkAuth, checkRole(["Admin"]), createUser);

// READ all users (Admins and Managers)
router.get("/", checkAuth, checkRole(["Admin", "Manager"]), getAllUsers);

// READ a single user by ID (Admins and Managers)
router.get("/:id", checkAuth, checkRole(["Admin", "Manager"]), getUserById);

// UPDATE a user by ID
// Any authenticated user can attempt this, but the controller logic and RLS policies
// will enforce who can update what.
router.put("/:id", checkAuth, updateUser);

// DELETE a user by ID (Only Admins)
router.delete("/:id", checkAuth, checkRole(["Admin"]), deleteUser);

export default router;
