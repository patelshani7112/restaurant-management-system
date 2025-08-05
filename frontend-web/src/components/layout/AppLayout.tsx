/* =================================================================
 * PATH: frontend-web/src/components/layout/AppLayout.tsx
 * ================================================================= */
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div
        className={`relative flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-64" : "ml-0" // Adjusts margin when sidebar is open on desktop
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
