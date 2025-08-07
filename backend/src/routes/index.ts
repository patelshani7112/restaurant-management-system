/* =================================================================
 * PATH: backend/src/routes/index.ts
 * ================================================================= */
import { Router } from "express";
import healthRouter from "./health.routes";
import userRouter from "./user.routes";
import authRouter from "./auth.routes";
import departmentRouter from "./department.routes";
import roleRouter from "./role.routes";
import scheduleRouter from "./schedule.routes";
import timeOffRouter from "./timeOff.routes"; // 1. IMPORT

const router = Router();

router.use("/health", healthRouter);
router.use("/users", userRouter);
router.use("/auth", authRouter);
router.use("/departments", departmentRouter);
router.use("/roles", roleRouter);
router.use("/schedules", scheduleRouter);
router.use("/time-off", timeOffRouter); // 2. MOUNT

export default router;
