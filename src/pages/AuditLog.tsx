import { useEffect, useState } from "react";
import { supabase } from "./../lib/supabase";
import { useWorkspaceContext } from "./../context/WorkspaceContext";

type AuditLogEntry = {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string | Record<string, unknown> | null;
  created_at: string;
};

export default function AuditLog() {
  const { workspace, loading: workspaceLoading } =
    useWorkspaceContext();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAuditLogs = async () => {
      if (!workspace?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("audit_logs")
        .select(
          "id, workspace_id, user_id, action, entity_type, entity_id, details, created_at",
        )
        .eq("workspace_id", workspace.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("AUDIT LOG ERROR:", error);
        setError(error.message);
        setLogs([]);
      } else {
        setLogs(data ?? []);
      }

      setLoading(false);
    };

    void loadAuditLogs();
  }, [workspace?.id]);

  const formatDetails = (
    details: AuditLogEntry["details"],
  ) => {
    if (!details) {
      return "";
    }

    if (typeof details === "string") {
      return details;
    }

    return JSON.stringify(details);
  };

  if (workspaceLoading || loading) {
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
            Loading audit activity...
          </p>
        </div>
      </div>
    );
  }

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

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load audit logs: {error}
        </div>
      )}

      {logs.length === 0 && !error && (
        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">
            No audit activity to display.
          </p>
        </div>
      )}

      {logs.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="divide-y">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-5 hover:bg-gray-50"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {log.action}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {log.entity_type}
                      {log.entity_id
                        ? ` • ${log.entity_id}`
                        : ""}
                    </p>

                    {log.details && (
                      <p className="mt-2 text-sm text-gray-700">
                        {formatDetails(log.details)}
                      </p>
                    )}
                  </div>

                  <p className="whitespace-nowrap text-sm text-gray-400">
                    {new Date(
                      log.created_at,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}