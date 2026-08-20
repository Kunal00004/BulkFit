import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";

import AuthPage from "./pages/Auth.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import DietPage from "./pages/Diet.jsx";
import WorkoutPage from "./pages/Workout.jsx";

function AuthRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthRedirect />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/diet"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DietPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/workout"
        element={
          <ProtectedRoute>
            <AppLayout>
              <WorkoutPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
