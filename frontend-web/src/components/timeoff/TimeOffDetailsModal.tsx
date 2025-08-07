/* =================================================================
 * PATH: frontend-web/src/components/timeoff/TimeOffDetailsModal.tsx
 * ================================================================= */
import React from "react";
import { format, parseISO } from "date-fns";
import type { TimeOffRequest } from "../../pages/TimeOffPage";

interface TimeOffDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TimeOffRequest | null;
  isManagerView: boolean;
  onStatusUpdate?: (requestId: number, status: "approved" | "denied") => void;
}

const TimeOffDetailsModal: React.FC<TimeOffDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
  isManagerView,
  onStatusUpdate,
}) => {
  if (!isOpen || !request) return null;

  const getStatusClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Employee</p>
            <p className="text-lg">
              {request.profiles.first_name} {request.profiles.last_name}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Dates Requested</p>
            <p className="text-lg">
              {format(parseISO(request.start_date), "MMM do, yyyy")} -{" "}
              {format(parseISO(request.end_date), "MMM do, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p
              className={`mt-1 inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                request.status
              )}`}
            >
              {request.status}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Reason</p>
            <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded-md border">
              {request.reason || <i>No reason provided.</i>}
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
          {isManagerView && request.status === "pending" && onStatusUpdate && (
            <>
              <button
                onClick={() => onStatusUpdate(request.id, "denied")}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Deny
              </button>
              <button
                onClick={() => onStatusUpdate(request.id, "approved")}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeOffDetailsModal;
