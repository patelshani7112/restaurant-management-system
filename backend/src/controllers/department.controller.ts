/*
 * PATH: backend/src/controllers/department.controller.ts
 * This controller handles all CRUD logic for the 'departments' table.
 */

import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";

// Get all departments
export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("departments").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch departments.", details: error.message });
  }
};

// Create a new department
export const createDepartment = async (req: Request, res: Response) => {
  const { department_name } = req.body;
  if (!department_name) {
    return res.status(400).json({ error: "department_name is required." });
  }

  try {
    const { data, error } = await supabase
      .from("departments")
      .insert({ department_name })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to create department.", details: error.message });
  }
};

// Update an existing department
export const updateDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { department_name } = req.body;
  if (!department_name) {
    return res.status(400).json({ error: "department_name is required." });
  }

  try {
    const { data, error } = await supabase
      .from("departments")
      .update({ department_name })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: "Department not found." });
    }
    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to update department.", details: error.message });
  }
};

// Delete a department
export const deleteDepartment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) throw error;
    res.status(204).send(); // No content on successful deletion
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to delete department.", details: error.message });
  }
};
