/* =================================================================
 * PATH: frontend-web/src/components/auth/ProtectedRoute.tsx
 * This component wraps our private routes to protect them from
 * unauthenticated access.
 * ================================================================= */
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
  // Check for the authentication token in local storage
  const token = localStorage.getItem("auth_token");

  if (!token) {
    // If no token is found, redirect the user to the login page
    return <Navigate to="/login" replace />;
  }

  // If a token is found, render the child routes (e.g., AppLayout)
  return <Outlet />;
};

export default ProtectedRoute;
