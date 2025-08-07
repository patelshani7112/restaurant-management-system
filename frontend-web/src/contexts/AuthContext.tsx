/* =================================================================
 * PATH: frontend-web/src/contexts/AuthContext.tsx
 * ================================================================= */
import React, { createContext, useState, useContext, useEffect } from "react";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role_name: string;
  // Add any other profile fields you need globally
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (profile: UserProfile, token: string) => void;
  logout: () => void;
  updateProfile: (updatedProfile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session when the app loads
    const storedToken = localStorage.getItem("auth_token");
    const storedProfile = localStorage.getItem("user_profile");
    if (storedToken && storedProfile) {
      setToken(storedToken);
      setUser(JSON.parse(storedProfile));
    }
    setLoading(false);
  }, []);

  const login = (profile: UserProfile, token: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_profile", JSON.stringify(profile));
    setToken(token);
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_profile");
    setToken(null);
    setUser(null);
  };

  const updateProfile = (updatedProfile: UserProfile) => {
    localStorage.setItem("user_profile", JSON.stringify(updatedProfile));
    setUser(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
