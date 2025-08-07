/* =================================================================
 * PATH: frontend-web/src/components/auth/ProtectedRoute.tsx
 * ================================================================= */
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  // Show a loading indicator while checking for a session
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // If no user is found, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If a user is found, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
