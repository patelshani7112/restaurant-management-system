/* =================================================================
 * PATH: frontend-web/src/pages/DashboardPage.tsx
 * ================================================================= */
import React from "react";

const DashboardPage: React.FC = () => {
  const userProfile = JSON.parse(localStorage.getItem("user_profile") || "{}");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      <p className="mt-1 text-gray-600">
        Welcome back, {userProfile.first_name || "User"}!
      </p>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700">Quick Stats</h2>
        <p className="mt-4 text-gray-600">
          Analytics and key performance indicators will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
