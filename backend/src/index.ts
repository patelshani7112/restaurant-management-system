/*
 * =================================================================
 * PATH: backend/src/index.ts
 * =================================================================
 * This is the main entry point for our backend application.
 * It initializes the Express server, applies middleware, sets up API routes,
 * and starts listening for requests on a specified port.
 */

import express, { Application } from "express";
import cors from "cors";
import "dotenv/config";

// CORRECTED: Removed the '.ts' extension from the import path.
import apiRouter from "./routes/index";

// --- Server Initialization ---
const app: Application = express();
const PORT: number = parseInt(process.env.PORT as string, 10) || 8080;

// --- Core Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use("/api/v1", apiRouter);

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`✅ TypeScript server is running on http://localhost:${PORT}`);
});
