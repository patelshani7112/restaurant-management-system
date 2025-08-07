/* =================================================================
 * PATH: backend/src/routes/timeOff.routes.ts
 * ================================================================= */
import { Router } from "express";
import {
  createTimeOffRequest,
  getTimeOffRequests,
  updateTimeOffRequestStatus,
} from "../controllers/timeOff.controller";
import { checkAuth, checkRole } from "../middleware/auth.middleware";

const router = Router();

// Any authenticated user can create or view requests (the controller handles who sees what).
router.post("/", checkAuth, createTimeOffRequest);
router.get("/", checkAuth, getTimeOffRequests);

// Only Admins and Managers can update the status of a request.
router.patch(
  "/:requestId/status",
  checkAuth,
  checkRole(["Admin", "Manager"]),
  updateTimeOffRequestStatus
);

export default router;
