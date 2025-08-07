/* =================================================================
 * PATH: frontend-web/src/components/schedule/CopyWeekModal.tsx
 * ================================================================= */
import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { format, startOfWeek } from "date-fns";

interface CopyWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  sourceWeekStartDate: string;
}

const CopyWeekModal: React.FC<CopyWeekModalProps> = ({
  isOpen,
  onClose,
  onSave,
  sourceWeekStartDate,
}) => {
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) {
      setError("Please select a target week.");
      return;
    }
    setLoading(true);
    setError(null);

    // Ensure the target date is a Monday
    const targetWeekStartDate = format(
      startOfWeek(new Date(targetDate), { weekStartsOn: 1 }),
      "yyyy-MM-dd"
    );

    try {
      await axiosClient.post("/schedules/copy", {
        sourceWeekStartDate,
        targetWeekStartDate,
      });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to copy schedule.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Copy Schedule</h2>
        <p className="mb-4 text-gray-600">
          Copy all shifts from the week of{" "}
          <span className="font-semibold">
            {format(new Date(sourceWeekStartDate), "MMM do")}
          </span>{" "}
          to a new week.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="target-date"
                className="block text-sm font-medium text-gray-700"
              >
                Select Target Week (any day in the week)
              </label>
              <input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
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
              {loading ? "Copying..." : "Copy Shifts"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CopyWeekModal;
