/* =================================================================
 * PATH: frontend-web/src/App.tsx
 * ================================================================= */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import AppLayout from "./components/layout/AppLayout";
import UserManagementPage from "./pages/UserManagementPage";
import ProtectedRoute from "./components/auth/ProtectedRoute"; // 1. Import the new component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Application Routes - Now Protected */}
        <Route element={<ProtectedRoute />}>
          {" "}
          {/* 2. Wrap the application layout */}
          <Route path="/app" element={<AppLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UserManagementPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
