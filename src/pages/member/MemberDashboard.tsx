import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

type WorkspaceData = {
  name: string;
  role: string;
};

export default function MemberDashboard() {
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspace() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        /*
         * STEP 1
         * Check whether the logged-in user owns a workspace.
         *
         * Your database has:
         * workspaces.owner_id
         */
        const { data: ownedWorkspace, error: ownerWorkspaceError } =
          await supabase
            .from("workspaces")
            .select("id, name")
            .eq("owner_id", user.id)
            .limit(1)
            .maybeSingle();

        if (ownerWorkspaceError) {
          console.error("Error finding owned workspace:", ownerWorkspaceError);
        }

        /*
         * If this user owns a workspace,
         * their dashboard role is Owner.
         */
        if (ownedWorkspace) {
          setWorkspace({
            name: ownedWorkspace.name,
            role: "owner",
          });

          return;
        }

        /*
         * STEP 2
         * If the user does not own a workspace,
         * look for their workspace_members record.
         */
        const { data: membership, error: membershipError } = await supabase
          .from("workspace_members")
          .select("workspace_id, role")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (membershipError) {
          console.error("Error finding workspace membership:", membershipError);

          setWorkspace(null);
          return;
        }

        /*
         * No membership means the user has no workspace.
         */
        if (!membership) {
          console.error("No workspace found for the current user.");

          setWorkspace(null);
          return;
        }

        /*
         * STEP 3
         * Get the workspace using workspace_id.
         */
        const { data: memberWorkspace, error: workspaceError } = await supabase
          .from("workspaces")
          .select("id, name")
          .eq("id", membership.workspace_id)
          .single();

        if (workspaceError) {
          console.error("Error loading member workspace:", workspaceError);

          setWorkspace(null);
          return;
        }

        /*
         * STEP 4
         * Store the real workspace and role.
         */
        setWorkspace({
          name: memberWorkspace.name,
          role: membership.role,
        });
      } catch (error) {
        console.error("Unexpected dashboard error:", error);

        setWorkspace(null);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspace();
  }, [user]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          <p className="mt-1 text-gray-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  /*
   * Dashboard
   */
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        <p className="mt-1 text-gray-500">
          Welcome to your WorkspaceGuard dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Workspace */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Workspace</h2>

          <p className="mt-2 text-2xl font-bold">
            {workspace?.name ?? "No workspace"}
          </p>
        </div>

        {/* Role */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Your Role</h2>

          <p className="mt-2 text-2xl font-bold capitalize">
            {workspace?.role ?? "No role"}
          </p>
        </div>

        {/* Status */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Status</h2>

          <p className="mt-2 text-2xl font-bold text-green-600">Active</p>
        </div>
      </div>
    </div>
  );
}
