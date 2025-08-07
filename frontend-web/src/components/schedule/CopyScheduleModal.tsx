/* =================================================================
 * PATH: frontend-web/src/components/schedule/CopyScheduleModal.tsx
 * ================================================================= */
import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import {
  format,
  startOfWeek,
  startOfDay,
  endOfDay,
  endOfWeek,
  isValid,
} from "date-fns";

interface CopyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialSourceDate: Date;
}

type CopyType = "day" | "week";
type ResolutionStrategy = "replace" | "skip";

const CopyScheduleModal: React.FC<CopyScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSourceDate,
}) => {
  const [copyType, setCopyType] = useState<CopyType>("week");
  const [sourceDate, setSourceDate] = useState(initialSourceDate);
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [conflict, setConflict] = useState<{ conflicts: string[] } | null>(
    null
  );

  // Reset state when modal opens or the initial date changes
  useEffect(() => {
    if (isOpen) {
      setSourceDate(initialSourceDate);
      setTargetDate("");
      setCopyType("week");
      setError(null);
      setConflict(null);
    }
  }, [isOpen, initialSourceDate]);

  const getSourceRange = () => {
    if (copyType === "day") {
      return { start: startOfDay(sourceDate), end: endOfDay(sourceDate) };
    }
    return {
      start: startOfWeek(sourceDate, { weekStartsOn: 1 }),
      end: endOfWeek(sourceDate, { weekStartsOn: 1 }),
    };
  };

  const handleInitialCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) {
      setError("Please select a target date.");
      return;
    }
    setLoading(true);
    setError(null);
    setConflict(null);

    const sourceRange = getSourceRange();
    // Use the raw date string from the input and add T00:00:00 to avoid timezone issues
    const targetStartDate = new Date(targetDate + "T00:00:00");

    try {
      await axiosClient.post("/schedules/copy-shifts", {
        source: {
          start: sourceRange.start.toISOString(),
          end: sourceRange.end.toISOString(),
        },
        target: { start: targetStartDate.toISOString() },
      });
      onSave();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setConflict(err.response.data);
      } else {
        setError(err.response?.data?.error || "Failed to copy schedule.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConflictResolution = async (strategy: ResolutionStrategy) => {
    setLoading(true);
    setError(null);

    const sourceRange = getSourceRange();
    const targetStartDate = new Date(targetDate + "T00:00:00");

    try {
      await axiosClient.post("/schedules/copy-shifts", {
        source: {
          start: sourceRange.start.toISOString(),
          end: sourceRange.end.toISOString(),
        },
        target: { start: targetStartDate.toISOString() },
        resolutionStrategy: strategy,
      });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to resolve conflict.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        {conflict ? (
          // Conflict Resolution View
          <div>
            <h2 className="text-2xl font-bold text-red-600">
              Scheduling Conflict
            </h2>
            <p className="my-4 text-gray-600">
              The following employees are already scheduled on the target
              date(s):
            </p>
            <ul className="list-disc list-inside bg-gray-100 p-3 rounded-md text-sm">
              {conflict.conflicts.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
            <p className="mt-4 text-gray-600">How would you like to proceed?</p>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => setConflict(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Back
              </button>
              <button
                onClick={() => handleConflictResolution("skip")}
                disabled={loading}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-yellow-300"
              >
                {loading ? "..." : "Skip Conflicting"}
              </button>
              <button
                onClick={() => handleConflictResolution("replace")}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400"
              >
                {loading ? "..." : "Replace All"}
              </button>
            </div>
          </div>
        ) : (
          // Initial Copy View
          <form onSubmit={handleInitialCopy}>
            <h2 className="text-2xl font-bold mb-4">Copy Schedule</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  What to copy?
                </label>
                <select
                  value={copyType}
                  onChange={(e) => setCopyType(e.target.value as CopyType)}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="week">
                    The week of{" "}
                    {isValid(sourceDate)
                      ? format(getSourceRange().start, "MMM do")
                      : "..."}
                  </option>
                  <option value="day">
                    The day of{" "}
                    {isValid(sourceDate)
                      ? format(sourceDate, "MMM do, yyyy")
                      : "..."}
                  </option>
                </select>
              </div>
              {copyType === "day" && (
                <div>
                  <label
                    htmlFor="source-date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Select Source Day
                  </label>
                  <input
                    id="source-date"
                    type="date"
                    value={
                      isValid(sourceDate)
                        ? format(sourceDate, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) => {
                      const newDate = new Date(e.target.value + "T00:00:00");
                      if (isValid(newDate)) {
                        setSourceDate(newDate);
                      }
                    }}
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
              )}
              <div>
                <label
                  htmlFor="target-date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Copy to... (select any day in the target period)
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
                {loading ? "Checking..." : "Copy Schedule"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CopyScheduleModal;
