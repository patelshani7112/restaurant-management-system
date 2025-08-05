/* =================================================================
 * PATH: frontend-web/src/components/UserFormModal.tsx
 * ================================================================= */
import React, { useState, useEffect } from "react";
import axios from "axios";

// Define a more detailed user profile type
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  department_id: number;
  phone_number?: string;
  date_of_birth?: string;
  hire_date?: string;
  pay_rate?: number;
  pay_type?: "hourly" | "salary";
  employee_status?: "active" | "inactive" | "on_leave";
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postal_code?: string;
  };
  emergency_contact?: { name?: string; relationship?: string; phone?: string };
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // To refresh the user list
  userToEdit: UserProfile | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roleId: 3,
    departmentId: 2,
    phoneNumber: "",
    dateOfBirth: "",
    hireDate: "",
    payRate: "",
    payType: "hourly",
    employeeStatus: "active",
    address: { street: "", city: "", province: "", postal_code: "" },
    emergencyContact: { name: "", relationship: "", phone: "" },
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditMode = !!userToEdit;
  const currentUser = JSON.parse(localStorage.getItem("user_profile") || "{}");
  const isEditingSelfAsAdmin =
    isEditMode &&
    currentUser.id === userToEdit?.id &&
    currentUser.role_name === "Admin";

  useEffect(() => {
    if (isEditMode && userToEdit) {
      setFormData({
        email: userToEdit.email || "",
        password: "", // Never pre-fill password
        firstName: userToEdit.first_name || "",
        lastName: userToEdit.last_name || "",
        roleId: userToEdit.role_id || 3,
        departmentId: userToEdit.department_id || 2,
        phoneNumber: userToEdit.phone_number || "",
        dateOfBirth: userToEdit.date_of_birth
          ? userToEdit.date_of_birth.split("T")[0]
          : "",
        hireDate: userToEdit.hire_date
          ? userToEdit.hire_date.split("T")[0]
          : "",
        payRate: userToEdit.pay_rate?.toString() || "",
        payType: userToEdit.pay_type || "hourly",
        employeeStatus: userToEdit.employee_status || "active",
        address: userToEdit.address || {
          street: "",
          city: "",
          province: "",
          postal_code: "",
        },
        emergencyContact: userToEdit.emergency_contact || {
          name: "",
          relationship: "",
          phone: "",
        },
      });
    } else {
      // Reset form for new user
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        roleId: 3,
        departmentId: 2,
        phoneNumber: "",
        dateOfBirth: "",
        hireDate: "",
        payRate: "",
        payType: "hourly",
        employeeStatus: "active",
        address: { street: "", city: "", province: "", postal_code: "" },
        emergencyContact: { name: "", relationship: "", phone: "" },
      });
    }
  }, [userToEdit, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    parentKey: "address" | "emergencyContact"
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [parentKey]: { ...prev[parentKey], [name]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("auth_token");

    // Clean up empty fields before sending
    const payload = {
      ...formData,
      payRate: formData.payRate ? parseFloat(formData.payRate) : null,
      dateOfBirth: formData.dateOfBirth || null,
      hireDate: formData.hireDate || null,
    };
    if (isEditMode) {
      delete (payload as any).password;
    }

    try {
      if (isEditMode) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/users/${userToEdit?.id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl my-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditMode ? "Edit User" : "Add New User"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-700">
              Personal Information
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                className="p-2 border rounded"
              />
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                className="p-2 border rounded"
              />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="p-2 border rounded"
              />
              {!isEditMode && (
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="p-2 border rounded"
                />
              )}
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className="p-2 border rounded"
              />
              <div>
                <label className="text-sm text-gray-600">Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
              </div>
            </div>
          </fieldset>

          {/* Employment Details */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-700">
              Employment Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                disabled={isEditingSelfAsAdmin}
                className="p-2 border rounded disabled:bg-gray-200"
              >
                <option value={1}>Admin</option>
                <option value={2}>Manager</option>
                <option value={3}>Staff</option>
                <option value={4}>Chef</option>
              </select>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="p-2 border rounded"
              >
                <option value={1}>Management</option>
                <option value={2}>Front of House</option>
                <option value={3}>Kitchen</option>
              </select>
              <select
                name="employeeStatus"
                value={formData.employeeStatus}
                onChange={handleChange}
                className="p-2 border rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
              <div>
                <label className="text-sm text-gray-600">Hire Date</label>
                <input
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleChange}
                  className="p-2 border rounded w-full"
                />
              </div>
              <input
                name="payRate"
                type="number"
                step="0.01"
                value={formData.payRate}
                onChange={handleChange}
                placeholder="Pay Rate"
                className="p-2 border rounded"
              />
              <select
                name="payType"
                value={formData.payType}
                onChange={handleChange}
                className="p-2 border rounded"
              >
                <option value="hourly">Hourly</option>
                <option value="salary">Salary</option>
              </select>
            </div>
            {isEditingSelfAsAdmin && (
              <p className="text-sm text-gray-500 mt-2">
                You cannot change your own role.
              </p>
            )}
          </fieldset>

          {/* Address */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-700">
              Address
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <input
                name="street"
                value={formData.address.street}
                onChange={(e) => handleNestedChange(e, "address")}
                placeholder="Street"
                className="p-2 border rounded md:col-span-2"
              />
              <input
                name="city"
                value={formData.address.city}
                onChange={(e) => handleNestedChange(e, "address")}
                placeholder="City"
                className="p-2 border rounded"
              />
              <input
                name="province"
                value={formData.address.province}
                onChange={(e) => handleNestedChange(e, "address")}
                placeholder="Province"
                className="p-2 border rounded"
              />
              <input
                name="postal_code"
                value={formData.address.postal_code}
                onChange={(e) => handleNestedChange(e, "address")}
                placeholder="Postal Code"
                className="p-2 border rounded"
              />
            </div>
          </fieldset>

          {/* Emergency Contact */}
          <fieldset className="border p-4 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-700">
              Emergency Contact
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <input
                name="name"
                value={formData.emergencyContact.name}
                onChange={(e) => handleNestedChange(e, "emergencyContact")}
                placeholder="Contact Name"
                className="p-2 border rounded"
              />
              <input
                name="relationship"
                value={formData.emergencyContact.relationship}
                onChange={(e) => handleNestedChange(e, "emergencyContact")}
                placeholder="Relationship"
                className="p-2 border rounded"
              />
              <input
                name="phone"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleNestedChange(e, "emergencyContact")}
                placeholder="Contact Phone"
                className="p-2 border rounded"
              />
            </div>
          </fieldset>

          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
