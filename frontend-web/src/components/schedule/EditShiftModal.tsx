/* =================================================================
 * PATH: frontend-web/src/components/schedule/EditShiftModal.tsx
 * ================================================================= */
import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
}

interface Shift {
  id: number;
  user_id: string;
  start: Date;
  end: Date;
}

interface EditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  users: UserProfile[];
  shift: Shift;
}

const EditShiftModal: React.FC<EditShiftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  users,
  shift,
}) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shift) {
      setSelectedUserId(shift.user_id);
      setStartTime(format(shift.start, "HH:mm"));
      setEndTime(format(shift.end, "HH:mm"));
    }
  }, [shift]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const finalStartTime = new Date(shift.start);
    finalStartTime.setHours(startHour, startMinute, 0, 0);

    const [endHour, endMinute] = endTime.split(":").map(Number);
    const finalEndTime = new Date(shift.start);
    finalEndTime.setHours(endHour, endMinute, 0, 0);

    // THE FIX: Check if the end time is on the next day
    if (finalEndTime <= finalStartTime) {
      finalEndTime.setDate(finalEndTime.getDate() + 1);
    }

    try {
      await axiosClient.put(`/schedules/shifts/${shift.id}`, {
        user_id: selectedUserId,
        start_time: finalStartTime.toISOString(),
        end_time: finalEndTime.toISOString(),
      });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update shift.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;
    setLoading(true);
    setError(null);
    try {
      await axiosClient.delete(`/schedules/shifts/${shift.id}`);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete shift.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Shift</h2>
        <p className="mb-4 text-gray-600">
          For date: {format(shift.start, "MMMM do, yyyy")}
        </p>
        <form onSubmit={handleUpdate}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employee
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                required
              >
                <option value="" disabled>
                  Select an Employee
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400"
            >
              Delete Shift
            </button>
            <div className="space-x-4">
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
                {loading ? "Saving..." : "Update Shift"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShiftModal;
