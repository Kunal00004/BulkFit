import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, userApi } from "../api/services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("bulkfit_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("bulkfit_token"));
  const [loading, setLoading] = useState(true);

  const persistSession = (authResponse) => {
    const { token: newToken, user: newUser } = authResponse;
    localStorage.setItem("bulkfit_token", newToken);
    localStorage.setItem("bulkfit_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

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

  const logout = useCallback(() => {
    localStorage.removeItem("bulkfit_token");
    localStorage.removeItem("bulkfit_user");
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await userApi.getMe();
      setUser(data);
      localStorage.setItem("bulkfit_user", JSON.stringify(data));
    } catch (err) {
      // token invalid / expired - axios interceptor handles redirect
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
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
