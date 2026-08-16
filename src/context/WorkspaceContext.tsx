import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

import type { WorkspaceRole } from "../types/workspace";

type Workspace = {
  id: string;
  name: string;
  owner_id: string;
};

type WorkspaceContextType = {
  workspace: Workspace | null;
  role: WorkspaceRole | null;
  loading: boolean;
  refreshWorkspace: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<WorkspaceRole | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkspace = async () => {
    if (!user) {
      setWorkspace(null);
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data: ownedWorkspace, error: ownerError } = await supabase
        .from("workspaces")
        .select("id, name, owner_id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (ownerError) {
        console.error("Error fetching workspace:", ownerError);
        setLoading(false);
        return;
      }

      if (ownedWorkspace) {
        setWorkspace(ownedWorkspace);
        setRole("owner");
        setLoading(false);
        return;
      }

      const { data: membership, error: memberError } = await supabase
        .from("workspace_members")
        .select("workspace_id, role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (memberError) {
        console.error("Error fetching membership:", memberError);
        setLoading(false);
        return;
      }

      if (!membership) {
        setWorkspace(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: memberWorkspace, error: workspaceError } = await supabase
        .from("workspaces")
        .select("id, name, owner_id")
        .eq("id", membership.workspace_id)
        .single();

      if (workspaceError) {
        console.error("Error fetching workspace:", workspaceError);
        setLoading(false);
        return;
      }

      setWorkspace(memberWorkspace);
      setRole(membership.role as WorkspaceRole);
    } catch (error) {
      console.error("Unexpected workspace error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWorkspace();
  }, [user]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        role,
        loading,
        refreshWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspaceContext must be used inside WorkspaceProvider"
    );
  }

  return context;
}