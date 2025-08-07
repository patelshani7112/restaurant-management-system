/* =================================================================
 * PATH: backend/src/controllers/schedule.controller.ts
 * ================================================================= */
import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";
import {
  addDays,
  differenceInCalendarDays,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  format,
} from "date-fns";

interface AuthenticatedRequest extends Request {
  user?: any;
  profile?: any;
}

// ... (getOrCreateSchedule, getShiftsByDateRange, updateShift, deleteShift, publishSchedule functions remain the same)
export const getOrCreateSchedule = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { weekStartDate } = req.params;
  const requestorProfile = req.profile;

  if (!weekStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
    return res
      .status(400)
      .json({ error: "A valid week start date is required." });
  }

  try {
    let { data: schedule, error: scheduleError } = await supabase
      .from("schedules")
      .select("*")
      .eq("week_start_date", weekStartDate)
      .single();

    if (scheduleError && scheduleError.code === "PGRST116") {
      if (["Admin", "Manager"].includes(requestorProfile.role_name)) {
        const { data: newSchedule, error: insertError } = await supabase
          .from("schedules")
          .insert({ week_start_date: weekStartDate })
          .select()
          .single();

        if (insertError) throw insertError;
        schedule = newSchedule;
      } else {
        return res.status(200).json({ schedule: null, shifts: [] });
      }
    } else if (scheduleError) {
      throw scheduleError;
    }

    if (!schedule) {
      return res
        .status(500)
        .json({ error: "Failed to get or create schedule." });
    }

    res.status(200).json({
      schedule,
      shifts: [],
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "An unexpected error occurred.", details: error.message });
  }
};

export const getShiftsByDateRange = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { startDate, endDate, weekStartDate } = req.query;
  const requestorProfile = req.profile;
  const requestorUser = req.user;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "startDate and endDate query parameters are required." });
  }

  try {
    let showAllShifts = false;

    if (["Admin", "Manager"].includes(requestorProfile.role_name)) {
      showAllShifts = true;
    } else if (weekStartDate) {
      const { data: schedule, error } = await supabase
        .from("schedules")
        .select("is_published")
        .eq("week_start_date", weekStartDate as string)
        .maybeSingle();

      if (error) {
        console.error("Error checking schedule publication status:", error);
        showAllShifts = false;
      } else if (schedule && schedule.is_published) {
        showAllShifts = true;
      }
    }

    let query = supabase
      .from("shifts")
      .select("*")
      .lte("start_time", endDate as string)
      .gte("end_time", startDate as string);

    if (!showAllShifts) {
      query = query.eq("user_id", requestorUser.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error: any) {
    console.error("Error in getShiftsByDateRange:", error);
    res
      .status(500)
      .json({ error: "An unexpected error occurred.", details: error.message });
  }
};

/**
 * Creates a new shift, now with time-off conflict detection.
 */
export const createShift = async (req: Request, res: Response) => {
  const { schedule_id, user_id, start_time, end_time } = req.body;

  if (!schedule_id || !user_id || !start_time || !end_time) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (new Date(start_time) < new Date()) {
    return res
      .status(403)
      .json({ error: "Cannot create a shift in the past." });
  }

  try {
    // THE FIX: Check for approved time-off requests before creating a shift.
    const { data: timeOff, error: timeOffError } = await supabase
      .from("time_off_requests")
      .select("id")
      .eq("user_id", user_id)
      .eq("status", "approved")
      .lte("start_date", end_time)
      .gte("end_date", start_time)
      .limit(1);

    if (timeOffError) throw timeOffError;

    if (timeOff && timeOff.length > 0) {
      return res.status(409).json({
        error:
          "Cannot create shift. The employee has approved time off during this period.",
      });
    }

    const { data, error } = await supabase
      .from("shifts")
      .insert({ schedule_id, user_id, start_time, end_time })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to create shift.", details: error.message });
  }
};

export const updateShift = async (req: Request, res: Response) => {
  const { shiftId } = req.params;
  const { user_id, start_time, end_time } = req.body;

  if (!user_id || !start_time || !end_time) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  try {
    const { data: existingShift, error: fetchError } = await supabase
      .from("shifts")
      .select("start_time, schedules(is_published)")
      .eq("id", shiftId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Shift not found." });
    }

    const isPublished = (existingShift.schedules as any)?.is_published || false;
    if (isPublished && new Date(existingShift.start_time) < new Date()) {
      return res.status(403).json({
        error: "Cannot edit a past or ongoing shift in a published schedule.",
      });
    }

    const { data, error } = await supabase
      .from("shifts")
      .update({ user_id, start_time, end_time })
      .eq("id", shiftId)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to update shift.", details: error.message });
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  const { shiftId } = req.params;

  try {
    const { data: existingShift, error: fetchError } = await supabase
      .from("shifts")
      .select("start_time, schedules(is_published)")
      .eq("id", shiftId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Shift not found." });
    }

    const isPublished = (existingShift.schedules as any)?.is_published || false;
    if (isPublished && new Date(existingShift.start_time) < new Date()) {
      return res.status(403).json({
        error: "Cannot delete a past or ongoing shift in a published schedule.",
      });
    }

    const { error } = await supabase.from("shifts").delete().eq("id", shiftId);
    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to delete shift.", details: error.message });
  }
};

export const publishSchedule = async (req: Request, res: Response) => {
  const { scheduleId } = req.params;
  const { is_published } = req.body;

  if (typeof is_published !== "boolean") {
    return res
      .status(400)
      .json({ error: "A boolean is_published status is required." });
  }

  try {
    const { data: schedule, error: fetchError } = await supabase
      .from("schedules")
      .select("week_start_date")
      .eq("id", scheduleId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Schedule not found." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStartDate = new Date(schedule.week_start_date);

    if (is_published === false && weekStartDate < today) {
      return res.status(403).json({
        error:
          "Cannot un-publish a schedule for a week that has already started.",
      });
    }

    const { data: updatedSchedule, error: updateError } = await supabase
      .from("schedules")
      .update({ is_published })
      .eq("id", scheduleId)
      .select()
      .single();

    if (updateError) throw updateError;
    res.status(200).json(updatedSchedule);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to update schedule status.",
      details: error.message,
    });
  }
};

/**
 * Copies shifts, now with time-off conflict detection.
 */
export const copyShifts = async (req: Request, res: Response) => {
  const { source, target, resolutionStrategy } = req.body;

  if (!source || !target || !source.start || !source.end || !target.start) {
    return res
      .status(400)
      .json({ error: "Source range and target start date are required." });
  }

  if (new Date(target.start) < startOfDay(new Date())) {
    return res
      .status(403)
      .json({ error: "Cannot copy shifts to a past date." });
  }

  try {
    const { data: sourceShifts, error: sourceError } = await supabase
      .from("shifts")
      .select("*, profiles(first_name, last_name)")
      .gte("start_time", source.start)
      .lte("start_time", source.end);
    if (sourceError) throw sourceError;
    if (!sourceShifts || sourceShifts.length === 0) {
      return res
        .status(200)
        .json({ message: "Source range has no shifts to copy." });
    }

    const dateDiff = differenceInCalendarDays(
      new Date(target.start),
      new Date(source.start)
    );

    const newShifts = sourceShifts.map((shift) => ({
      ...shift,
      start_time: addDays(new Date(shift.start_time), dateDiff),
      end_time: addDays(new Date(shift.end_time), dateDiff),
    }));

    const targetWeekStart = format(
      startOfWeek(new Date(target.start), { weekStartsOn: 1 }),
      "yyyy-MM-dd"
    );
    let { data: targetSchedule } = await supabase
      .from("schedules")
      .select("id")
      .eq("week_start_date", targetWeekStart)
      .single();
    if (!targetSchedule) {
      const { data: newSchedule, error } = await supabase
        .from("schedules")
        .insert({ week_start_date: targetWeekStart })
        .select("id")
        .single();
      if (error) throw error;
      targetSchedule = newSchedule;
    }

    // THE FIX: Automatically filter out shifts that conflict with approved time off.
    const userIds = [...new Set(newShifts.map((s) => s.user_id))];
    const { data: approvedTimeOff } = await supabase
      .from("time_off_requests")
      .select("user_id, start_date, end_date")
      .in("user_id", userIds)
      .eq("status", "approved");

    const nonConflictingNewShifts = newShifts.filter((newShift) => {
      return !approvedTimeOff?.some(
        (off) =>
          off.user_id === newShift.user_id &&
          new Date(newShift.start_time) < new Date(off.end_date) &&
          new Date(newShift.end_time) > new Date(off.start_date)
      );
    });

    const targetRangeStart = startOfDay(newShifts[0].start_time).toISOString();
    const targetRangeEnd = endOfDay(
      newShifts[newShifts.length - 1].start_time
    ).toISOString();

    const { data: conflictingShifts, error: conflictError } = await supabase
      .from("shifts")
      .select("id, user_id, profiles(first_name, last_name)")
      .gte("start_time", targetRangeStart)
      .lte("start_time", targetRangeEnd);
    if (conflictError) throw conflictError;

    const conflicts = nonConflictingNewShifts.filter((newShift) =>
      conflictingShifts?.some(
        (existingShift) => existingShift.user_id === newShift.user_id
      )
    );

    if (conflicts.length > 0 && !resolutionStrategy) {
      const conflictNames = conflicts.map((c) => {
        const profile = c.profiles as { first_name: string; last_name: string };
        return profile
          ? `${profile.first_name} ${profile.last_name}`
          : "An unknown user";
      });
      return res.status(409).json({
        error: "Scheduling conflict detected.",
        conflicts: [...new Set(conflictNames)],
      });
    }

    if (resolutionStrategy === "replace" && conflictingShifts) {
      const idsToDelete = conflictingShifts.map((s) => s.id);
      if (idsToDelete.length > 0) {
        await supabase.from("shifts").delete().in("id", idsToDelete);
      }
    }

    let shiftsToInsert = nonConflictingNewShifts;
    if (resolutionStrategy === "skip" && conflictingShifts) {
      const conflictingUserIds = new Set(
        conflictingShifts.map((s) => s.user_id)
      );
      shiftsToInsert = nonConflictingNewShifts.filter(
        (newShift) => !conflictingUserIds.has(newShift.user_id)
      );
    }

    const finalPayload = shiftsToInsert.map(
      ({ user_id, start_time, end_time }) => ({
        schedule_id: targetSchedule!.id,
        user_id,
        start_time: new Date(start_time).toISOString(),
        end_time: new Date(end_time).toISOString(),
      })
    );

    if (finalPayload.length > 0) {
      const { error: insertError } = await supabase
        .from("shifts")
        .insert(finalPayload);
      if (insertError) throw insertError;
    }

    res
      .status(201)
      .json({ message: `${finalPayload.length} shifts copied successfully.` });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "An unexpected error occurred.", details: error.message });
  }
};
