export default function AuditLog() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Audit Log
        </h1>

        <p className="mt-1 text-gray-500">
          Review workspace activity and member changes.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">
          No audit activity to display.
        </p>
      </div>
    </div>
  );
}