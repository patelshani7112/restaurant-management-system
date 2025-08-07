/* =================================================================
 * PATH: backend/src/routes/schedule.routes.ts
 * ================================================================= */
import { Router } from "express";
import {
  getOrCreateSchedule,
  createShift,
  updateShift,
  deleteShift,
  getShiftsByDateRange,
  publishSchedule,
} from "../controllers/schedule.controller";
import { checkAuth, checkRole } from "../middleware/auth.middleware";

const router = Router();

// Schedule container routes
router.get("/week/:weekStartDate", checkAuth, getOrCreateSchedule);
router.patch(
  "/:scheduleId/publish",
  checkAuth,
  checkRole(["Admin", "Manager"]),
  publishSchedule
);

// Shift routes
router.get("/shifts", checkAuth, getShiftsByDateRange);
router.post("/shifts", checkAuth, checkRole(["Admin", "Manager"]), createShift);
router.put(
  "/shifts/:shiftId",
  checkAuth,
  checkRole(["Admin", "Manager"]),
  updateShift
);
router.delete(
  "/shifts/:shiftId",
  checkAuth,
  checkRole(["Admin", "Manager"]),
  deleteShift
);

export default router;
