/* =================================================================
 * PATH: frontend-web/src/pages/TimeOffPage.tsx
 * ================================================================= */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../contexts/AuthContext";
import RequestList from "../components/timeoff/RequestList";
import NewRequestForm from "../components/timeoff/NewRequestForm";
import TimeOffDetailsModal from "../components/timeoff/TimeOffDetailsModal"; // 1. Import the new modal

// --- TYPE DEFINITIONS ---
export interface TimeOffRequest {
  id: number;
  user_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: "pending" | "approved" | "denied";
  profiles: {
    first_name: string;
    last_name: string;
  };
}

// --- MAIN COMPONENT ---
const TimeOffPage: React.FC = () => {
  const { user } = useAuth();
  const isManagerOrAdmin = useMemo(
    () => user && ["Admin", "Manager"].includes(user.role_name),
    [user]
  );

  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState(
    isManagerOrAdmin ? "review" : "myRequests"
  );
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);

  // 2. Add state for the details modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(
    null
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get("/time-off");
      setRequests(response.data);
    } catch (err) {
      setError("Failed to fetch time-off requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (
    requestId: number,
    status: "approved" | "denied"
  ) => {
    try {
      await axiosClient.patch(`/time-off/${requestId}/status`, { status });
      setIsDetailsModalOpen(false); // Close modal on success
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Could not update request status.");
    }
  };

  // 3. Handler to open the details modal
  const handleSelectRequest = (request: TimeOffRequest) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests]
  );
  const myRequests = useMemo(
    () => requests.filter((r) => r.user_id === user?.id),
    [requests, user]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Time Off Requests</h1>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {isManagerOrAdmin && (
            <button
              onClick={() => setActiveTab("review")}
              className={`${
                activeTab === "review"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Review Requests
            </button>
          )}
          <button
            onClick={() => setActiveTab("myRequests")}
            className={`${
              activeTab === "myRequests"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Requests
          </button>
        </nav>
      </div>

      <div>
        {loading && <p>Loading requests...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <>
            {activeTab === "review" && isManagerOrAdmin && (
              <RequestList
                title="Pending Requests for Review"
                requests={pendingRequests}
                isManagerView={true}
                onStatusUpdate={handleStatusUpdate}
                onSelectRequest={handleSelectRequest}
              />
            )}
            {activeTab === "myRequests" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">My Request History</h2>
                  <button
                    onClick={() => setIsRequestFormOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    + New Request
                  </button>
                </div>
                <RequestList
                  requests={myRequests}
                  isManagerView={false}
                  onSelectRequest={handleSelectRequest}
                />
              </div>
            )}
          </>
        )}
      </div>

      <NewRequestForm
        isOpen={isRequestFormOpen}
        onClose={() => setIsRequestFormOpen(false)}
        onSave={fetchData}
      />

      {/* 4. Render the new details modal */}
      <TimeOffDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        request={selectedRequest}
        isManagerView={isManagerOrAdmin && activeTab === "review"}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default TimeOffPage;
