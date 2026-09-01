import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, userApi } from "../api/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("bulkfit_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("bulkfit_token"));
  const [isLoading, setIsLoading] = useState(true); // Isko App.jsx ke hisaab se theek kiya

  const persistSession = (authResponse) => {
    const { token: newToken, user: newUser } = authResponse;
    localStorage.setItem("bulkfit_token", newToken);
    localStorage.setItem("bulkfit_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = useCallback(() => {
    localStorage.removeItem("bulkfit_token");
    localStorage.removeItem("bulkfit_user");
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    persistSession(data);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    persistSession(data);
    return data;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await userApi.getMe();
      setUser(data);
      localStorage.setItem("bulkfit_user", JSON.stringify(data));
    } catch (err) {
      console.error("Session expired or invalid.", err);
      logout(); // Token invalid hone par user ko automatically logout karo
    }
  }, [logout]);

  useEffect(() => {
    const bootstrap = async () => {
      if (token) {
        await refreshUser();
      }
      setIsLoading(false); // App ab seamlessly load hogi
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading, // Yahan return kiya taaki App.jsx isko read kar sake
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}