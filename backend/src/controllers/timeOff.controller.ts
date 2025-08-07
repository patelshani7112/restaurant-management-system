/* =================================================================
 * PATH: backend/src/controllers/timeOff.controller.ts
 * ================================================================= */
import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";
import { startOfWeek, format } from "date-fns";

interface AuthenticatedRequest extends Request {
  user?: any;
  profile?: any;
}

/**
 * Creates a new time-off request with security checks.
 */
export const createTimeOffRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { start_date, end_date, reason } = req.body;
  const userId = req.user.id;

  if (!start_date || !end_date) {
    return res
      .status(400)
      .json({ error: "Start date and end date are required." });
  }

  const requestStartDate = new Date(start_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Rule: Prevent creating requests in the past.
  if (requestStartDate < today) {
    return res
      .status(403)
      .json({ error: "Cannot request time off for a past date." });
  }

  try {
    // Rule: Prevent requests if the week is already published.
    const weekStartDate = format(
      startOfWeek(requestStartDate, { weekStartsOn: 1 }),
      "yyyy-MM-dd"
    );
    const { data: schedule, error: scheduleError } = await supabase
      .from("schedules")
      .select("is_published")
      .eq("week_start_date", weekStartDate)
      .single();

    if (schedule && schedule.is_published) {
      return res.status(403).json({
        error:
          "Cannot request time off for a week that has already been published.",
      });
    }

    const { data, error } = await supabase
      .from("time_off_requests")
      .insert({ user_id: userId, start_date, end_date, reason })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to create time-off request.",
      details: error.message,
    });
  }
};

/**
 * Gets a list of time-off requests based on user role.
 */
export const getTimeOffRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const requestorProfile = req.profile;
  const requestorId = req.user.id;

  try {
    let query = supabase
      .from("time_off_requests")
      .select("*, profiles(first_name, last_name)");

    // Admins see all requests.
    // Managers see requests from Staff and Chefs.
    if (requestorProfile.role_name === "Manager") {
      query = query.in("profiles.role_name", ["Staff", "Chef"]);
    }
    // Staff/Chefs only see their own requests.
    else if (!["Admin", "Manager"].includes(requestorProfile.role_name)) {
      query = query.eq("user_id", requestorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch time-off requests.",
      details: error.message,
    });
  }
};

/**
 * Updates the status of a time-off request (approve/deny).
 */
export const updateTimeOffRequestStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { requestId } = req.params;
  const { status } = req.body;
  const requestorProfile = req.profile;

  if (!status || !["approved", "denied"].includes(status)) {
    return res
      .status(400)
      .json({ error: 'A valid status ("approved" or "denied") is required.' });
  }

  try {
    // Security Check: Ensure the user being approved/denied is of a lower rank.
    const { data: requestToUpdate, error: fetchError } = await supabase
      .from("time_off_requests")
      .select("*, profiles(role_name)")
      .eq("id", requestId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Request not found." });
    }

    const targetUserRole = (requestToUpdate.profiles as any)?.role_name;

    if (
      requestorProfile.role_name === "Manager" &&
      targetUserRole === "Admin"
    ) {
      return res
        .status(403)
        .json({ error: "Managers cannot approve requests for Admins." });
    }

    const { data, error } = await supabase
      .from("time_off_requests")
      .update({ status })
      .eq("id", requestId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update request status.",
      details: error.message,
    });
  }
};
