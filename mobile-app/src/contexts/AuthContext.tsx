/* =================================================================
 * PATH: mobile-app/src/contexts/AuthContext.tsx
 * ================================================================= */
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role_name: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (profile: UserProfile, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser(profile);
          setToken(session.access_token);
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = (profile: UserProfile, token: string) => {
    setToken(token);
    setUser(profile);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
