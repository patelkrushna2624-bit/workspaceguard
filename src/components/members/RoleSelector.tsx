import type { SecurityRole } from "../../hooks/useMembers";

type RoleSelectorProps = {
  role: SecurityRole;
  disabled?: boolean;
  onChange: (role: SecurityRole) => void;
};

export default function RoleSelector({
  role,
  disabled = false,
  onChange,
}: RoleSelectorProps) {
  return (
    <select
      value={role}
      disabled={disabled}
      onChange={(event) =>
        onChange(event.target.value as SecurityRole)
      }
      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="viewer">Viewer</option>
      <option value="editor">Editor</option>
      <option value="admin">Admin</option>
    </select>
  );
}