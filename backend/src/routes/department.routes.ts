/*
 * PATH: backend/src/routes/department.routes.ts
 * This file defines the API routes for managing departments.
 */

import { Router } from "express";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller";
import { checkAuth, checkRole } from "../middleware/auth.middleware";

const router = Router();

// Anyone authenticated can view the departments
router.get("/", checkAuth, getAllDepartments);

// Only Admins can create, update, or delete departments
router.post("/", checkAuth, checkRole(["Admin"]), createDepartment);
router.put("/:id", checkAuth, checkRole(["Admin"]), updateDepartment);
router.delete("/:id", checkAuth, checkRole(["Admin"]), deleteDepartment);

export default router;
