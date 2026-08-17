
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useWorkspaceContext } from "../context/WorkspaceContext";

export type SecurityRole =
  | "owner"
  | "admin"
  | "editor"
  | "viewer"
  | "member";

export type WorkspaceMember = {
  id: string;
  user_id: string;
  workspace_id: string;
  role: SecurityRole;
  can_edit: boolean;
  can_delete: boolean;
  can_invite: boolean;
  created_at: string;

  profile: {
    id: string;
    email: string;
    full_name: string;
  } | null;
};

export type PermissionUpdate = {
  can_edit?: boolean;
  can_delete?: boolean;
  can_invite?: boolean;
};

export function useMembers() {
  const { workspace } = useWorkspaceContext();

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * ---------------------------------------------------------
   * Fetch members
   * ---------------------------------------------------------
   */
  const fetchMembers = useCallback(async () => {
    if (!workspace?.id) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: membersError } = await supabase
        .from("workspace_members")
        .select(`
          id,
          user_id,
          workspace_id,
          role,
          can_edit,
          can_delete,
          can_invite,
          created_at,
          profiles!workspace_members_user_id_fkey (
            id,
            email,
            full_name
          )
        `)
        .eq("workspace_id", workspace.id)
        .order("created_at", {
          ascending: true,
        });

      console.log("MEMBERS DATA:", data);
      console.log("MEMBERS ERROR:", membersError);
      console.log("CURRENT WORKSPACE ID:", workspace.id);

      if (membersError) {
        console.error("MEMBERS ERROR:", membersError);
        setError(membersError.message);
        setMembers([]);
        return;
      }

      const formattedMembers: WorkspaceMember[] = (data ?? []).map(
        (member: any) => ({
          id: member.id,
          user_id: member.user_id,
          workspace_id: member.workspace_id,

          role: (member.role || "viewer") as SecurityRole,

          can_edit: Boolean(member.can_edit),
          can_delete: Boolean(member.can_delete),
          can_invite: Boolean(member.can_invite),

          created_at: member.created_at,

          profile: member.profiles
            ? {
                id: member.profiles.id,
                email: member.profiles.email,
                full_name: member.profiles.full_name,
              }
            : null,
        }),
      );

      console.log("FORMATTED MEMBERS:", formattedMembers);

      setMembers(formattedMembers);
    } catch (err) {
      console.error("Unexpected members error:", err);

      setError(
        "Something went wrong while loading members.",
      );
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  /*
   * ---------------------------------------------------------
   * Audit log helper
   * ---------------------------------------------------------
   */
  const createAuditLog = async ({
    action,
    entityId,
    details,
  }: {
    action: string;
    entityId: string;
    details: Record<string, unknown>;
  }) => {
    if (!workspace?.id) {
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error(
          "AUDIT LOG ERROR: No authenticated user found.",
        );
        return;
      }

      const { error: auditError } = await supabase
        .from("audit_logs")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          action,
          entity_type: "workspace_member",
          entity_id: entityId,
          details,
        });

      if (auditError) {
        console.error(
          "AUDIT LOG INSERT ERROR:",
          auditError,
        );
      } else {
        console.log(
          "AUDIT LOG CREATED:",
          action,
        );
      }
    } catch (err) {
      console.error(
        "UNEXPECTED AUDIT LOG ERROR:",
        err,
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * Change role
   * ---------------------------------------------------------
   */
  const updateMemberRole = async (
    memberId: string,
    role: SecurityRole,
  ) => {
    setError(null);

    /*
     * Find the member before changing the role
     * so we can record the old and new role.
     */
    const member = members.find(
      (item) => item.id === memberId,
    );

    const oldRole = member?.role ?? null;

    const { error: updateError } = await supabase
      .from("workspace_members")
      .update({ role })
      .eq("id", memberId);

    if (updateError) {
      console.error(
        "UPDATE ROLE ERROR:",
        updateError,
      );

      setError(updateError.message);

      return {
        error: updateError,
      };
    }

    /*
     * Create audit record.
     */
    await createAuditLog({
      action: "role_updated",
      entityId: memberId,
      details: {
        member_email: member?.profile?.email ?? null,
        member_name: member?.profile?.full_name ?? null,
        old_role: oldRole,
        new_role: role,
      },
    });

    await fetchMembers();

    return {
      error: null,
    };
  };

  /*
   * ---------------------------------------------------------
   * Change permissions
   * ---------------------------------------------------------
   */
  const updateMemberPermissions = async (
    memberId: string,
    permissions: PermissionUpdate,
  ) => {
    setError(null);

    /*
     * Find member so audit log contains useful information.
     */
    const member = members.find(
      (item) => item.id === memberId,
    );

    const { error: updateError } = await supabase
      .from("workspace_members")
      .update(permissions)
      .eq("id", memberId);

    if (updateError) {
      console.error(
        "UPDATE PERMISSION ERROR:",
        updateError,
      );

      setError(updateError.message);

      return {
        error: updateError,
      };
    }

    /*
     * Create audit record.
     */
    await createAuditLog({
      action: "permissions_updated",
      entityId: memberId,
      details: {
        member_email: member?.profile?.email ?? null,
        member_name: member?.profile?.full_name ?? null,
        changed_permissions: permissions,
      },
    });

    await fetchMembers();

    return {
      error: null,
    };
  };

  /*
   * ---------------------------------------------------------
   * Remove member
   * ---------------------------------------------------------
   */
  const removeMember = async (
    memberId: string,
  ) => {
    setError(null);

    /*
     * Get member information BEFORE deleting it.
     */
    const member = members.find(
      (item) => item.id === memberId,
    );

    const { error: deleteError } = await supabase
      .from("workspace_members")
      .delete()
      .eq("id", memberId);

    if (deleteError) {
      console.error(
        "REMOVE MEMBER ERROR:",
        deleteError,
      );

      setError(deleteError.message);

      return {
        error: deleteError,
      };
    }

    /*
     * Create audit record AFTER successful deletion.
     */
    await createAuditLog({
      action: "member_removed",
      entityId: memberId,
      details: {
        member_email: member?.profile?.email ?? null,
        member_name: member?.profile?.full_name ?? null,
        role: member?.role ?? null,
      },
    });

    await fetchMembers();

    return {
      error: null,
    };
  };

  /*
   * ---------------------------------------------------------
   * Initial load
   * ---------------------------------------------------------
   */
  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,

    refreshMembers: fetchMembers,

    updateMemberRole,
    updateMemberPermissions,
    removeMember,
  };
}
