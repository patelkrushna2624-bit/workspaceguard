export default function MemberDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          Welcome to your WorkspaceGuard dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">
            Workspace
          </h2>

          <p className="mt-2 text-2xl font-bold">
            WorkspaceGuard
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">
            Your Role
          </h2>

          <p className="mt-2 text-2xl font-bold">
            Member
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">
            Status
          </h2>

          <p className="mt-2 text-2xl font-bold text-green-600">
            Active
          </p>
        </div>
      </div>
    </div>
  );
}