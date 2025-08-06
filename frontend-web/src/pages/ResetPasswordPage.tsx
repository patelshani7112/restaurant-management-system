/* =================================================================
 * PATH: frontend-web/src/pages/ResetPasswordPage.tsx
 * ================================================================= */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient"; // Use the new client

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Supabase's client library automatically handles the token from the URL hash
  // when the page loads. We just need to call the updateUser function.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Use the Supabase client directly to update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      // After a successful password update, the user is logged in.
      // We should clear any old session data and redirect to login.
      await supabase.auth.signOut();
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_profile");

      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to reset password. The link may have expired or the password is too weak."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // A simple check to see if the user landed here without a token
    if (!window.location.hash.includes("access_token")) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">Set New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="w-full p-2 border rounded"
          />
          {message && <p className="text-green-600">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? "Saving..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
