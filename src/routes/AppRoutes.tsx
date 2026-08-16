import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/layout/DashboardLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AcceptInvite from "../pages/auth/AcceptInvite";

import MemberDashboard from "../pages/member/MemberDashboard";
import TeamManagement from "../pages/owner/TeamManagement";
import AuditLog from "../pages/AuditLog";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Invitation callback */}
      <Route
        path="/accept-invite"
        element={<AcceptInvite />}
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/dashboard"
            element={<MemberDashboard />}
          />

          <Route
            path="/settings/team"
            element={<TeamManagement />}
          />

          <Route
            path="/audit-log"
            element={<AuditLog />}
          />
        </Route>
      </Route>

      {/* Unknown route */}
      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}