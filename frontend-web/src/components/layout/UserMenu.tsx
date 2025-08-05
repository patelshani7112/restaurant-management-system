/* =================================================================
 * PATH: frontend-web/src/components/layout/UserMenu.tsx
 * ================================================================= */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../services/axiosClient"; // Import the centralized client

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const profileString = localStorage.getItem("user_profile");
    if (profileString) {
      const profile = JSON.parse(profileString);
      const initials = `${profile.first_name?.charAt(0) || ""}${
        profile.last_name?.charAt(0) || ""
      }`.toUpperCase();
      setUserInitials(initials);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Use axiosClient to call the logout endpoint.
      // The token is added automatically by the interceptor.
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
      // We proceed with cleanup even if the server call fails
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_profile");
      navigate("/login");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-full text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {userInitials}
      </button>

      {isOpen && (
        <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl z-20">
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Your Profile
          </a>
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
          </a>
          <div className="border-t border-gray-100"></div>
          <button
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
