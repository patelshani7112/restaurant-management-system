/* =================================================================
 * PATH: frontend-web/src/App.tsx
 * ================================================================= */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import AppLayout from "./components/layout/AppLayout";
import UserManagementPage from "./pages/UserManagementPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; // Import
import ResetPasswordPage from "./pages/ResetPasswordPage"; // Import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Application Routes - Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
