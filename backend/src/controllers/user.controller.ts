/*
 * PATH: backend/src/controllers/user.controller.ts
 * This controller handles all logic related to user management (CRUD).
 * UPDATED: Fixed a bug where admins could not update their own profile.
 */

import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";

interface AuthenticatedRequest extends Request {
  user?: any;
  profile?: any;
}

// ... (The createUser, getAllUsers, and getUserById functions remain the same)
export const createUser = async (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    roleId,
    departmentId,
    avatarUrl,
    dateOfBirth,
    phoneNumber,
    address,
    hireDate,
    payRate,
    payType,
    emergencyContact,
  } = req.body;

  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !roleId ||
    !departmentId
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: email, password, firstName, lastName, roleId, departmentId are required.",
    });
  }

  try {
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
      });

    if (authError) {
      return res.status(409).json({ error: authError.message });
    }
    if (!authData.user) {
      return res
        .status(500)
        .json({ error: "User could not be created in Auth." });
    }

    const newUserId = authData.user.id;
    const profileToInsert = {
      id: newUserId,
      email: email,
      first_name: firstName,
      last_name: lastName,
      role_id: roleId,
      department_id: departmentId,
      avatar_url: avatarUrl,
      date_of_birth: dateOfBirth,
      phone_number: phoneNumber,
      address: address,
      hire_date: hireDate,
      pay_rate: payRate,
      pay_type: payType,
      emergency_contact: emergencyContact,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .insert(profileToInsert);

    if (profileError) {
      console.error(
        "Failed to create profile for user:",
        newUserId,
        profileError
      );
      return res.status(500).json({
        error: "User created in Auth, but failed to create profile.",
        details: profileError.message,
      });
    }

    res.status(201).json({
      message: "User created successfully.",
      user: {
        id: newUserId,
        email: authData.user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "An unexpected error occurred.", details: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "An unexpected error occurred.", details: error.message });
  }
};

/**
 * Updates a user's profile with corrected security checks.
 */
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params; // The ID of the user to update
  const requestor = req.user; // The user MAKING the request
  const requestorProfile = req.profile;

  const updates = { ...req.body }; // Get a mutable copy of the request body

  // THE FIX: If an admin is editing their own profile, we explicitly remove
  // the 'roleId' from the update payload to prevent the error.
  if (requestorProfile.role_name === "Admin" && requestor.id === id) {
    delete updates.roleId;
  }

  // Map frontend camelCase names to backend snake_case names
  const dbPayload: { [key: string]: any } = {};
  if (updates.firstName) dbPayload.first_name = updates.firstName;
  if (updates.lastName) dbPayload.last_name = updates.lastName;
  if (updates.roleId) dbPayload.role_id = updates.roleId;
  if (updates.departmentId) dbPayload.department_id = updates.departmentId;
  if (updates.avatarUrl) dbPayload.avatar_url = updates.avatarUrl;
  if (updates.dateOfBirth) dbPayload.date_of_birth = updates.dateOfBirth;
  if (updates.phoneNumber) dbPayload.phone_number = updates.phoneNumber;
  if (updates.address) dbPayload.address = updates.address;
  if (updates.hireDate) dbPayload.hire_date = updates.hireDate;
  if (updates.payRate) dbPayload.pay_rate = updates.payRate;
  if (updates.payType) dbPayload.pay_type = updates.payType;
  if (updates.emergencyContact)
    dbPayload.emergency_contact = updates.emergencyContact;
  if (updates.employeeStatus)
    dbPayload.employee_status = updates.employeeStatus;
  if (updates.terminationDate)
    dbPayload.termination_date = updates.terminationDate;

  if (Object.keys(dbPayload).length === 0) {
    return res
      .status(400)
      .json({ error: "No valid fields provided for update." });
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(403).json({
        error: "Update failed. Check permissions or user existence.",
        details: error.message,
      });
    }

    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "An unexpected error occurred.", details: error.message });
  }
};

/**
 * Deletes a user with new security checks.
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data: userToDelete, error: fetchError } = await supabase
      .from("profiles")
      .select("role_name")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "User to delete not found." });
    }

    if (userToDelete.role_name === "Admin") {
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role_name", "Admin");

      if (countError) throw countError;

      if (count !== null && count <= 1) {
        return res
          .status(403)
          .json({ error: "Forbidden. Cannot delete the last admin account." });
      }
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(id);

    if (deleteError) {
      return res.status(500).json({
        error: "Failed to delete user from authentication system.",
        details: deleteError.message,
      });
    }

    res.status(204).send(); // Success
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "An unexpected error occurred.", details: error.message });
  }
};
