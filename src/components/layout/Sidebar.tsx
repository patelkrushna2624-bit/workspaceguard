import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const getClassName = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-3 py-2 text-sm font-medium ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="min-h-screen w-64 border-r bg-white p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">
          WorkspaceGuard
        </h2>
      </div>

      <nav className="space-y-2">
        <NavLink to="/dashboard" className={getClassName}>
          Dashboard
        </NavLink>

        <NavLink to="/settings/team" className={getClassName}>
          Team Members
        </NavLink>

        <NavLink to="/audit-log" className={getClassName}>
          Audit Log
        </NavLink>
      </nav>
    </aside>
  );
}