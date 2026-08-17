import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useWorkspaceContext } from "../../context/WorkspaceContext";
import { useAuth } from "../../hooks/useAuth";
import {
  useMembers,
  type SecurityRole,
  type WorkspaceMember,
} from "../../hooks/useMembers";

import MemberList from "../../components/members/MemberList";

export default function TeamManagement() {
  const { user } = useAuth();

  const {
    workspace,
    role,
    loading: workspaceLoading,
  } = useWorkspaceContext();

  const {
    members,
    loading: membersLoading,
    error,
    updateMemberRole,
    updateMemberPermissions,
    removeMember,
  } = useMembers();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  /*
   * Only workspace owners can manage team members.
   */
  const canManage = role === "owner";

  /*
   * ---------------------------------------------------------
   * SEARCH MEMBERS
   * ---------------------------------------------------------
   *
   * Searches by:
   * - Member name
   * - Member email
   * - Member role
   */
  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return members;
    }

    return members.filter((member) => {
      const name =
        member.profile?.full_name?.toLowerCase() ?? "";

      /*
       * We use JSON.stringify here so this also works even if
       * your WorkspaceMember profile type does not currently
       * expose "email" in TypeScript.
       */
      const profileText = JSON.stringify(
        member.profile ?? {},
      ).toLowerCase();

      const memberRole =
        member.role?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        profileText.includes(query) ||
        memberRole.includes(query)
      );
    });
  }, [members, searchQuery]);

  /*
   * ---------------------------------------------------------
   * INVITE MEMBER
   * ---------------------------------------------------------
   */
  const handleInvite = async () => {
    const email = inviteEmail.trim();

    if (!email) {
      setInviteMessage(
        "Please enter an email address.",
      );
      return;
    }

    if (!workspace?.id) {
      setInviteMessage(
        "Workspace not found.",
      );
      return;
    }

    if (!canManage) {
      setInviteMessage(
        "You do not have permission to invite members.",
      );
      return;
    }

    setInviteLoading(true);
    setInviteMessage("");

    try {
      const { data, error } =
        await supabase.functions.invoke(
          "invite-member",
          {
            body: {
              email,
              workspaceId: workspace.id,
            },
          },
        );

      if (error) {
        console.error(
          "INVITE ERROR:",
          error,
        );

        let errorMessage = error.message;

        try {
          if (error.context) {
            const response =
              error.context as Response;

            if (
              response &&
              typeof response.clone ===
                "function"
            ) {
              const clonedResponse =
                response.clone();

              const responseText =
                await clonedResponse.text();

              console.error(
                "FUNCTION RESPONSE BODY:",
                responseText,
              );

              if (responseText) {
                try {
                  const parsed =
                    JSON.parse(
                      responseText,
                    );

                  if (parsed?.error) {
                    errorMessage =
                      parsed.error;
                  } else {
                    errorMessage =
                      `${error.message} - ${responseText}`;
                  }
                } catch {
                  errorMessage =
                    `${error.message} - ${responseText}`;
                }
              }
            }
          }
        } catch (debugError) {
          console.error(
            "Could not read function error body:",
            debugError,
          );
        }

        setInviteMessage(
          `Invitation failed: ${errorMessage}`,
        );

        return;
      }

      if (data?.error) {
        console.error(
          "FUNCTION RETURNED ERROR:",
          data.error,
        );

        setInviteMessage(
          `Invitation failed: ${data.error}`,
        );

        return;
      }

      setInviteMessage(
        "Invitation sent successfully!",
      );

      setInviteEmail("");
    } catch (err) {
      console.error(
        "UNEXPECTED INVITE ERROR:",
        err,
      );

      if (err instanceof Error) {
        setInviteMessage(
          `Invitation failed: ${err.message}`,
        );
      } else {
        setInviteMessage(
          "Something went wrong while sending the invitation.",
        );
      }
    } finally {
      setInviteLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CHANGE ROLE
   * ---------------------------------------------------------
   */
  const handleRoleChange = async (
    member: WorkspaceMember,
    newRole: SecurityRole,
  ) => {
    if (!canManage) {
      return;
    }

    if (member.role === newRole) {
      return;
    }

    const confirmed = window.confirm(
      `Change ${
        member.profile?.full_name ??
        "this member"
      }'s role to ${newRole}?`,
    );

    if (!confirmed) {
      return;
    }

    const { error } =
      await updateMemberRole(
        member.id,
        newRole,
      );

    if (error) {
      setInviteMessage(
        `Failed to update role: ${error.message}`,
      );
      return;
    }

    setInviteMessage(
      "Member role updated successfully.",
    );
  };

  /*
   * ---------------------------------------------------------
   * CHANGE PERMISSION
   * ---------------------------------------------------------
   */
  const handlePermissionChange = async (
    member: WorkspaceMember,
    permission:
      | "can_edit"
      | "can_delete"
      | "can_invite",
    value: boolean,
  ) => {
    if (!canManage) {
      return;
    }

    const { error } =
      await updateMemberPermissions(
        member.id,
        {
          [permission]: value,
        },
      );

    if (error) {
      setInviteMessage(
        `Failed to update permission: ${error.message}`,
      );
      return;
    }

    setInviteMessage(
      "Permission updated successfully.",
    );
  };

  /*
   * ---------------------------------------------------------
   * REMOVE MEMBER
   * ---------------------------------------------------------
   */
  const handleRemove = async (
    member: WorkspaceMember,
  ) => {
    if (!canManage) {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${
        member.profile?.full_name ??
        "this member"
      } from the workspace?`,
    );

    if (!confirmed) {
      return;
    }

    const { error } =
      await removeMember(member.id);

    if (error) {
      setInviteMessage(
        `Failed to remove member: ${error.message}`,
      );
      return;
    }

    setInviteMessage(
      "Member removed successfully.",
    );
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */
  if (workspaceLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 text-white">
        Loading workspace...
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-slate-400">
            WorkspaceGuard
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Team Management
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your workspace and team members.
          </p>
        </div>

        {/* Workspace summary */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* Workspace */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Workspace
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              {workspace?.name ??
                "No workspace"}
            </h2>
          </div>

          {/* Role */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Your Role
            </p>

            <h2 className="mt-2 text-xl font-semibold capitalize">
              {role ?? "Unknown"}
            </h2>
          </div>

          {/* Account */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Account
            </p>

            <h2 className="mt-2 truncate text-xl font-semibold">
              {user?.email ?? "Unknown"}
            </h2>
          </div>
        </div>

        {/* Team */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Team Members
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Invite and manage your workspace team members.
            </p>
          </div>

          {/* Invite */}
          {canManage && (
            <div className="mb-8">
              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) =>
                    setInviteEmail(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !inviteLoading
                    ) {
                      void handleInvite();
                    }
                  }}
                  placeholder="Enter member email"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={handleInvite}
                  disabled={inviteLoading}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {inviteLoading
                    ? "Sending..."
                    : "Send Invitation"}
                </button>
              </div>

              {inviteMessage && (
                <div className="mt-3 rounded-lg border border-slate-700 bg-slate-800 p-3">
                  <p className="wrap-break-word text-sm text-slate-300">
                    {inviteMessage}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <label
              htmlFor="member-search"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Search team members
            </label>

            <div className="relative">
              <input
                id="member-search"
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder="Search by name, email, or role..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 pr-20 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {searchQuery && (
              <p className="mt-2 text-sm text-slate-400">
                Showing{" "}
                <span className="font-medium text-white">
                  {filteredMembers.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-white">
                  {members.length}
                </span>{" "}
                members
              </p>
            )}
          </div>

          {/* Permission message */}
          {!canManage && (
            <div className="mb-6 rounded-lg border border-yellow-900 bg-yellow-950/30 p-4 text-sm text-yellow-300">
              You are a member of this workspace and do not
              have permission to manage team members.
            </div>
          )}

          {/* General error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* No search results */}
          {!membersLoading &&
            members.length > 0 &&
            filteredMembers.length === 0 && (
              <div className="mb-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-10 text-center">
                <h3 className="text-lg font-semibold text-white">
                  No members found
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Try a different name, email, or role.
                </p>
              </div>
            )}

          {/* Members */}
          <MemberList
            members={filteredMembers}
            loading={membersLoading}
            canManage={canManage}
            onRoleChange={handleRoleChange}
            onPermissionChange={
              handlePermissionChange
            }
            onRemove={handleRemove}
          />
        </div>
      </div>
    </div>
  );
}