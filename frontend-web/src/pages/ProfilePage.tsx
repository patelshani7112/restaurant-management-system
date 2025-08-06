/* =================================================================
 * PATH: frontend-web/src/pages/ProfilePage.tsx
 * REDESIGNED: This page now features a single form with a save
 * button for a more intuitive user experience.
 * ================================================================= */
import React, { useState, useEffect } from "react";
import axiosClient from "../services/axiosClient";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_name: string;
  department_name: string;
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

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: { street: "", city: "", province: "", postal_code: "" },
    emergencyContact: { name: "", relationship: "", phone: "" },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Load initial profile data from local storage
    const storedProfile = localStorage.getItem("user_profile");
    if (storedProfile) {
      const parsedProfile: UserProfile = JSON.parse(storedProfile);
      setProfile(parsedProfile);
      // Initialize form data with the user's current details
      setFormData({
        firstName: parsedProfile.first_name || "",
        lastName: parsedProfile.last_name || "",
        phoneNumber: parsedProfile.phone_number || "",
        dateOfBirth: parsedProfile.date_of_birth
          ? parsedProfile.date_of_birth.split("T")[0]
          : "",
        address: parsedProfile.address || {
          street: "",
          city: "",
          province: "",
          postal_code: "",
        },
        emergencyContact: parsedProfile.emergency_contact || {
          name: "",
          relationship: "",
          phone: "",
        },
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Make the API call to update the profile
      const response = await axiosClient.put(`/users/${profile.id}`, formData);

      // On success, update the local state and localStorage
      const updatedProfile = response.data;
      setProfile(updatedProfile);
      localStorage.setItem("user_profile", JSON.stringify(updatedProfile));
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">My Profile</h1>

      <form
        onSubmit={handleSaveProfile}
        className="mt-6 bg-white rounded-lg shadow-md"
      >
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Personal Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Update your personal details below.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            {/* Editable Fields */}
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">First Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Phone Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Date of Birth
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </dd>
            </div>
            {/* Address Fields */}
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 space-y-2">
                <input
                  type="text"
                  name="street"
                  value={formData.address.street}
                  onChange={(e) => handleNestedChange(e, "address")}
                  placeholder="Street"
                  className="w-full p-2 border rounded-md"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    name="city"
                    value={formData.address.city}
                    onChange={(e) => handleNestedChange(e, "address")}
                    placeholder="City"
                    className="w-full p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    name="province"
                    value={formData.address.province}
                    onChange={(e) => handleNestedChange(e, "address")}
                    placeholder="Province"
                    className="w-full p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.address.postal_code}
                    onChange={(e) => handleNestedChange(e, "address")}
                    placeholder="Postal Code"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </dd>
            </div>
            {/* Emergency Contact Fields */}
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Emergency Contact
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    name="name"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleNestedChange(e, "emergencyContact")}
                    placeholder="Name"
                    className="w-full p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    name="relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleNestedChange(e, "emergencyContact")}
                    placeholder="Relationship"
                    className="w-full p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleNestedChange(e, "emergencyContact")}
                    placeholder="Phone"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </dd>
            </div>

            {/* Read-only Fields */}
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {profile.email}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {profile.role_name}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {profile.department_name}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Hire Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {profile.hire_date
                  ? new Date(profile.hire_date).toLocaleDateString()
                  : "N/A"}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Pay Rate</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {profile.pay_rate
                  ? `$${profile.pay_rate} / ${profile.pay_type}`
                  : "N/A"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          {error && <span className="text-sm text-red-600 mr-4">{error}</span>}
          {success && (
            <span className="text-sm text-green-600 mr-4">{success}</span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
