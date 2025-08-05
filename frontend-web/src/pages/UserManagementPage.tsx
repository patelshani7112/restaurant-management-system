/* =================================================================
 * PATH: frontend-web/src/pages/UserManagementPage.tsx
 * ================================================================= */
import React, { useEffect, useState, useMemo } from "react";
import axiosClient from "../services/axiosClient";
import UserFormModal from "../components/UserFormModal";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_name: string;
  role_id: number;
  department_name: string;
  department_id: number;
  // Add other detailed fields to match the modal's needs
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem("user_profile") || "{}"),
    []
  );
  const adminCount = useMemo(
    () => users.filter((u) => u.role_name === "Admin").length,
    [users]
  );

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get("/users");
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users. You may not have permission.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddNewUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await axiosClient.delete(`/users/${userId}`);
      fetchUsers(); // Refresh list after delete
    } catch (err: any) {
      alert(
        `Failed to delete user: ${err.response?.data?.error || "Server error"}`
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            User Management
          </h1>
          <p className="mt-1 text-gray-600">
            Add, edit, or remove user accounts.
          </p>
        </div>
        {currentUser.role_name === "Admin" && (
          <button
            onClick={handleAddNewUser}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            + Add New User
          </button>
        )}
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        {loading && <p>Loading users...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const isLastAdmin =
                    user.role_name === "Admin" && adminCount <= 1;
                  const isCurrentUser = user.id === currentUser.id;
                  return (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isLastAdmin && isCurrentUser}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchUsers}
        userToEdit={editingUser}
      />
    </div>
  );
};

export default UserManagementPage;
