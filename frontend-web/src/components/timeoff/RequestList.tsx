/* =================================================================
 * PATH: frontend-web/src/components/timeoff/RequestList.tsx
 * ================================================================= */
import React from "react";
import { format, parseISO } from "date-fns";
import type { TimeOffRequest } from "../../pages/TimeOffPage";

interface RequestListProps {
  title?: string;
  requests: TimeOffRequest[];
  isManagerView: boolean;
  onStatusUpdate?: (requestId: number, status: "approved" | "denied") => void;
  onSelectRequest: (request: TimeOffRequest) => void; // New prop to handle clicks
}

const RequestList: React.FC<RequestListProps> = ({
  title,
  requests,
  isManagerView,
  onStatusUpdate,
  onSelectRequest,
}) => {
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

  if (requests.length === 0) {
    return (
      <p className="text-gray-500">
        {isManagerView
          ? "No pending requests to review."
          : "You have not made any time-off requests."}
      </p>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {title && <h2 className="text-xl font-semibold p-4">{title}</h2>}
      <ul role="list" className="divide-y divide-gray-200">
        {requests.map((request) => (
          <li key={request.id}>
            {/* THE FIX: The entire content is now a clickable button */}
            <button
              onClick={() => onSelectRequest(request)}
              className="w-full text-left px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-600 truncate">
                  {isManagerView
                    ? `${request.profiles.first_name} ${request.profiles.last_name}`
                    : "Request"}
                </p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    {format(parseISO(request.start_date), "MMM do, yyyy")} -{" "}
                    {format(parseISO(request.end_date), "MMM do, yyyy")}
                  </p>
                </div>
                {isManagerView &&
                  request.status === "pending" &&
                  onStatusUpdate && (
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 space-x-2">
                      <span className="font-medium text-gray-500">
                        Click to review
                      </span>
                    </div>
                  )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RequestList;
