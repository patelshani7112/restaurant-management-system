/*
 * PATH: backend/src/controllers/role.controller.ts
 * This controller handles all CRUD logic for the 'roles' table.
 */

import { Request, Response } from "express";
import { supabase } from "../config/supabaseClient";

// Get all roles
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("roles").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch roles.", details: error.message });
  }
};

// Create a new role
export const createRole = async (req: Request, res: Response) => {
  const { role_name } = req.body;
  if (!role_name) {
    return res.status(400).json({ error: "role_name is required." });
  }

  try {
    const { data, error } = await supabase
      .from("roles")
      .insert({ role_name })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to create role.", details: error.message });
  }
};

// Update an existing role
export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role_name } = req.body;
  if (!role_name) {
    return res.status(400).json({ error: "role_name is required." });
  }

  try {
    const { data, error } = await supabase
      .from("roles")
      .update({ role_name })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: "Role not found." });
    }
    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to update role.", details: error.message });
  }
};

// Delete a role
export const deleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from("roles").delete().eq("id", id);
    if (error) throw error;
    res.status(204).send(); // No content on successful deletion
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to delete role.", details: error.message });
  }
};
