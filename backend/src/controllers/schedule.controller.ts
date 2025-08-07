// /* =================================================================
//  * PATH: backend/src/controllers/schedule.controller.ts
//  * This controller handles all logic related to weekly schedules and shifts.
//  * ================================================================= */
// import { Request, Response } from "express";
// import { supabase } from "../config/supabaseClient";

// interface AuthenticatedRequest extends Request {
//   user?: any;
//   profile?: any;
// }

// // ... (getOrCreateSchedule and getShiftsByDateRange functions remain the same)
// export const getOrCreateSchedule = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   const { weekStartDate } = req.params;
//   const requestorProfile = req.profile;

//   if (!weekStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
//     return res
//       .status(400)
//       .json({ error: "A valid week start date is required." });
//   }

//   try {
//     let { data: schedule, error: scheduleError } = await supabase
//       .from("schedules")
//       .select("*")
//       .eq("week_start_date", weekStartDate)
//       .single();

//     if (scheduleError && scheduleError.code === "PGRST116") {
//       if (["Admin", "Manager"].includes(requestorProfile.role_name)) {
//         const { data: newSchedule, error: insertError } = await supabase
//           .from("schedules")
//           .insert({ week_start_date: weekStartDate })
//           .select()
//           .single();

//         if (insertError) throw insertError;
//         schedule = newSchedule;
//       } else {
//         return res.status(200).json({ schedule: null, shifts: [] });
//       }
//     } else if (scheduleError) {
//       throw scheduleError;
//     }

//     if (!schedule) {
//       return res
//         .status(500)
//         .json({ error: "Failed to get or create schedule." });
//     }

//     res.status(200).json({
//       schedule,
//       shifts: [],
//     });
//   } catch (error: any) {
//     res
//       .status(500)
//       .json({ error: "An unexpected error occurred.", details: error.message });
//   }
// };

// export const getShiftsByDateRange = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   const { startDate, endDate, weekStartDate } = req.query;
//   const requestorProfile = req.profile;
//   const requestorUser = req.user;

//   if (!startDate || !endDate) {
//     return res
//       .status(400)
//       .json({ error: "startDate and endDate query parameters are required." });
//   }

//   try {
//     let showAllShifts = false;

//     if (["Admin", "Manager"].includes(requestorProfile.role_name)) {
//       showAllShifts = true;
//     } else if (weekStartDate) {
//       const { data: schedule, error } = await supabase
//         .from("schedules")
//         .select("is_published")
//         .eq("week_start_date", weekStartDate as string)
//         .maybeSingle();

//       if (error) {
//         console.error("Error checking schedule publication status:", error);
//         showAllShifts = false;
//       } else if (schedule && schedule.is_published) {
//         showAllShifts = true;
//       }
//     }

//     let query = supabase
//       .from("shifts")
//       .select("*")
//       .lte("start_time", endDate as string)
//       .gte("end_time", startDate as string);

//     if (!showAllShifts) {
//       query = query.eq("user_id", requestorUser.id);
//     }

//     const { data, error } = await query;

//     if (error) throw error;

//     res.status(200).json(data || []);
//   } catch (error: any) {
//     console.error("Error in getShiftsByDateRange:", error);
//     res
//       .status(500)
//       .json({ error: "An unexpected error occurred.", details: error.message });
//   }
// };

// /**
//  * Creates a new shift, preventing creation in the past.
//  */
// export const createShift = async (req: Request, res: Response) => {
//   const { schedule_id, user_id, start_time, end_time } = req.body;

//   if (!schedule_id || !user_id || !start_time || !end_time) {
//     return res.status(400).json({ error: "Missing required fields." });
//   }

//   // THE FIX: Prevent creating a shift that has already started.
//   if (new Date(start_time) < new Date()) {
//     return res
//       .status(403)
//       .json({ error: "Cannot create a shift in the past." });
//   }

//   try {
//     const { data, error } = await supabase
//       .from("shifts")
//       .insert({ schedule_id, user_id, start_time, end_time })
//       .select()
//       .single();

//     if (error) throw error;
//     res.status(201).json(data);
//   } catch (error: any) {
//     res
//       .status(500)
//       .json({ error: "Failed to create shift.", details: error.message });
//   }
// };

// /**
//  * Updates an existing shift, preventing edits to past/ongoing shifts.
//  */
// export const updateShift = async (req: Request, res: Response) => {
//   const { shiftId } = req.params;
//   const { user_id, start_time, end_time } = req.body;

//   if (!user_id || !start_time || !end_time) {
//     return res.status(400).json({ error: "Required fields are missing." });
//   }

//   try {
//     // THE FIX: First, fetch the original shift to check its start time.
//     const { data: existingShift, error: fetchError } = await supabase
//       .from("shifts")
//       .select("start_time")
//       .eq("id", shiftId)
//       .single();

//     if (fetchError) {
//       return res.status(404).json({ error: "Shift not found." });
//     }

//     // Prevent editing a shift that has already started.
//     if (new Date(existingShift.start_time) < new Date()) {
//       return res.status(403).json({
//         error: "Cannot edit a shift that is in the past or currently ongoing.",
//       });
//     }

//     // If the check passes, proceed with the update.
//     const { data, error } = await supabase
//       .from("shifts")
//       .update({ user_id, start_time, end_time })
//       .eq("id", shiftId)
//       .select()
//       .single();

//     if (error) throw error;
//     res.status(200).json(data);
//   } catch (error: any) {
//     res
//       .status(500)
//       .json({ error: "Failed to update shift.", details: error.message });
//   }
// };

// /**
//  * Deletes a shift, preventing deletion of past/ongoing shifts.
//  */
// export const deleteShift = async (req: Request, res: Response) => {
//   const { shiftId } = req.params;

//   try {
//     // THE FIX: First, fetch the original shift to check its start time.
//     const { data: existingShift, error: fetchError } = await supabase
//       .from("shifts")
//       .select("start_time")
//       .eq("id", shiftId)
//       .single();

//     if (fetchError) {
//       return res.status(404).json({ error: "Shift not found." });
//     }

//     // Prevent deleting a shift that has already started.
//     if (new Date(existingShift.start_time) < new Date()) {
//       return res.status(403).json({
//         error:
//           "Cannot delete a shift that is in the past or currently ongoing.",
//       });
//     }

//     // If the check passes, proceed with the deletion.
//     const { error } = await supabase.from("shifts").delete().eq("id", shiftId);
//     if (error) throw error;
//     res.status(204).send();
//   } catch (error: any) {
//     res
//       .status(500)
//       .json({ error: "Failed to delete shift.", details: error.message });
//   }
// };

// // ... (publishSchedule function remains the same)
// export const publishSchedule = async (req: Request, res: Response) => {
//   const { scheduleId } = req.params;
//   const { is_published } = req.body;

//   if (typeof is_published !== "boolean") {
//     return res
//       .status(400)
//       .json({ error: "A boolean is_published status is required." });
//   }

//   try {
//     const { data, error } = await supabase
//       .from("schedules")
//       .update({ is_published })
//       .eq("id", scheduleId)
//       .select()
//       .single();

//     if (error) {
//       return res
//         .status(404)
//         .json({ error: "Schedule not found or could not be updated." });
//     }
//     res.status(200).json(data);
//   } catch (error: any) {
//     res.status(500).json({
//       error: "Failed to update schedule status.",
//       details: error.message,
//     });
//   }
// };

/* =================================================================
 * PATH: backend/src/controllers/schedule.controller.ts
 * This controller handles all logic related to weekly schedules and shifts.
 * ================================================================= */
import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";

interface AuthenticatedRequest extends Request {
  user?: any;
  profile?: any;
}

// ... (getOrCreateSchedule and getShiftsByDateRange functions remain the same)
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
 * Creates a new shift, preventing creation in the past.
 */
export const createShift = async (req: Request, res: Response) => {
  const { schedule_id, user_id, start_time, end_time } = req.body;

  if (!schedule_id || !user_id || !start_time || !end_time) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // THE FIX: Prevent creating a shift that has already started.
  if (new Date(start_time) < new Date()) {
    return res
      .status(403)
      .json({ error: "Cannot create a shift in the past." });
  }

  try {
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

/**
 * Updates an existing shift, preventing edits to past/ongoing shifts.
 */
export const updateShift = async (req: Request, res: Response) => {
  const { shiftId } = req.params;
  const { user_id, start_time, end_time } = req.body;

  if (!user_id || !start_time || !end_time) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  try {
    // THE FIX: First, fetch the original shift to check its start time.
    const { data: existingShift, error: fetchError } = await supabase
      .from("shifts")
      .select("start_time")
      .eq("id", shiftId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Shift not found." });
    }

    // Prevent editing a shift that has already started.
    if (new Date(existingShift.start_time) < new Date()) {
      return res.status(403).json({
        error: "Cannot edit a shift that is in the past or currently ongoing.",
      });
    }

    // If the check passes, proceed with the update.
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

/**
 * Deletes a shift, preventing deletion of past/ongoing shifts.
 */
export const deleteShift = async (req: Request, res: Response) => {
  const { shiftId } = req.params;

  try {
    // THE FIX: First, fetch the original shift to check its start time.
    const { data: existingShift, error: fetchError } = await supabase
      .from("shifts")
      .select("start_time")
      .eq("id", shiftId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Shift not found." });
    }

    // Prevent deleting a shift that has already started.
    if (new Date(existingShift.start_time) < new Date()) {
      return res.status(403).json({
        error:
          "Cannot delete a shift that is in the past or currently ongoing.",
      });
    }

    // If the check passes, proceed with the deletion.
    const { error } = await supabase.from("shifts").delete().eq("id", shiftId);
    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to delete shift.", details: error.message });
  }
};

// ... (publishSchedule function remains the same)
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
