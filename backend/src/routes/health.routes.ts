/*
 * =================================================================
 * PATH: backend/src/routes/health.routes.ts
 * =================================================================
 * This file defines the routes related to health checks.
 * It imports the controller function and maps it to a specific URL endpoint.
 */

import { Router } from "express";

// CORRECTED: Removed the '.ts' extension from the import path.
import { checkHealth } from "../controllers/health.controller";

const router = Router();

// Define the GET route for /health
// When a request hits this URL, the checkHealth controller function will be executed.
router.get("/", checkHealth);

export default router;
