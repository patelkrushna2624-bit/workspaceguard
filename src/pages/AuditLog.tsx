import { useEffect, useState } from "react";
import { supabase } from "./../lib/supabase";
import { useWorkspaceContext } from "./../context/WorkspaceContext";

type AuditLogEntry = {
  id: string;
  workspace_id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: string | Record<string, unknown> | null;
  created_at: string;
};

export default function AuditLog() {
  const { workspace, loading: workspaceLoading } = useWorkspaceContext();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAuditLogs = async () => {
      console.log("AUDIT: workspace =", workspace);

      if (!workspace?.id) {
        console.log("AUDIT: No workspace ID available");
        setLogs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      console.log("AUDIT: Loading logs for workspace:", workspace.id);

      const { data, error: supabaseError } = await supabase
        .from("audit_logs")
        .select(
          `
            id,
            workspace_id,
            user_id,
            action,
            entity_type,
            entity_id,
            details,
            created_at
          `,
        )
        .eq("workspace_id", workspace.id)
        .order("created_at", {
          ascending: false,
        });

      console.log("AUDIT: Supabase data =", data);
      console.log("AUDIT: Supabase error =", supabaseError);

      if (supabaseError) {
        console.error("AUDIT LOG ERROR:", supabaseError);

        setError(supabaseError.message);
        setLogs([]);
      } else {
        setLogs(data ?? []);
      }

      setLoading(false);
    };

    void loadAuditLogs();
  }, [workspace?.id]);

  const formatDetails = (details: AuditLogEntry["details"]) => {
    if (!details) {
      return "";
    }

    if (typeof details === "string") {
      return details;
    }

    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  };

  if (workspaceLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>

          <p className="mt-1 text-gray-500">
            Review workspace activity and member changes.
          </p>
        </div>

        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">Loading audit activity...</p>
        </div>
      </div>
    );
  }

  if (!workspace?.id) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>

          <p className="mt-1 text-gray-500">
            Review workspace activity and member changes.
          </p>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <p className="font-medium text-yellow-800">
            No workspace is currently selected.
          </p>

          <p className="mt-1 text-sm text-yellow-700">
            The audit log cannot be loaded until a workspace is available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>

        <p className="mt-1 text-gray-500">
          Review workspace activity and member changes.
        </p>

        <p className="mt-1 text-xs text-gray-400">Workspace: {workspace.id}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Failed to load audit logs</p>

          <p className="mt-1">{error}</p>
        </div>
      )}

      {!error && logs.length === 0 && (
        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          <p className="font-medium text-gray-700">
            No audit activity to display.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            No audit records were returned for this workspace.
          </p>

          <p className="mt-2 text-xs text-gray-400">
            Workspace ID: {workspace.id}
          </p>
        </div>
      )}

      {logs.length > 0 && (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="p-5 hover:bg-gray-50">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900">
                      {log.action}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {log.entity_type ?? "Activity"}

                      {log.entity_id ? ` • ${log.entity_id}` : ""}
                    </p>

                    {log.details && (
                      <pre className="mt-3 whitespace-pre-wrap overflow-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                        {formatDetails(log.details)}
                      </pre>
                    )}

                    {log.user_id && (
                      <p className="mt-2 text-xs text-gray-400">
                        User: {log.user_id}
                      </p>
                    )}
                  </div>

                  <p className="whitespace-nowrap text-sm text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
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
