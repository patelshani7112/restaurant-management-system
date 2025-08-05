/*
 * PATH: backend/src/controllers/health.controller.ts
 * This controller handles logic for health-check-related routes.
 * It's a good practice to have a simple endpoint to verify API status.
 */

import { Request, Response } from "express";

/**
 * Checks the health of the API.
 * @param req Express Request object
 * @param res Express Response object
 */
export const checkHealth = (req: Request, res: Response) => {
  // Respond with a success message, timestamp, and status
  res.status(200).json({
    status: "UP",
    message: "🎉 API is healthy and running! 🎉",
    timestamp: new Date().toISOString(),
  });
};
