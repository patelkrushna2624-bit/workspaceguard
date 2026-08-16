import { Routes, Route, Navigate } from "react-router-dom";

import TeamManagement from "./pages/owner/TeamManagement";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/settings/team" element={<TeamManagement />} />

        <Route path="/owner" element={<TeamManagement />} />

        <Route
          path="/audit-log"
          element={<div className="p-10 text-2xl">Audit Log Page</div>}
        />
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
