/* =================================================================
 * PATH: frontend-web/src/pages/ForgotPasswordPage.tsx
 * ================================================================= */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../services/axiosClient";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axiosClient.post("/auth/forgot-password", {
        email,
      });
      setMessage(response.data.message);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
