/*
 * PATH: backend/src/routes/role.routes.ts
 * This file defines the API routes for managing roles.
 */

import { Router } from "express";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/role.controller";
import { checkAuth, checkRole } from "../middleware/auth.middleware";

const router = Router();

// Anyone authenticated can view the roles
router.get("/", checkAuth, getAllRoles);

// Only Admins can create, update, or delete roles
router.post("/", checkAuth, checkRole(["Admin"]), createRole);
router.put("/:id", checkAuth, checkRole(["Admin"]), updateRole);
router.delete("/:id", checkAuth, checkRole(["Admin"]), deleteRole);

export default router;
