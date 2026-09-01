import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";

import AuthPage from "./pages/Auth.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import DietPage from "./pages/Diet.jsx";
import WorkoutPage from "./pages/Workout.jsx";
import CoachPage from './pages/Coach';

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Outlet /> 
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>; 
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} 
      />
      <Route path="/auth" element={<AuthPage />} />

      {/* Private/Protected Routes (Clean Structure with Navbar/Sidebar) */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/diet" element={<DietPage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/coach" element={<CoachPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}