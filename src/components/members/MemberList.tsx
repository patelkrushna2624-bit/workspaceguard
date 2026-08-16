import type { WorkspaceMember } from "../../hooks/useMembers";

import MemberCard from "./MemberCard";

type MemberListProps = {
  members: WorkspaceMember[];

  loading?: boolean;

  canManage: boolean;

  onRoleChange: (
    member: WorkspaceMember,
    role: WorkspaceMember["role"],
  ) => void;

  onPermissionChange: (
    member: WorkspaceMember,
    permission:
      | "can_edit"
      | "can_delete"
      | "can_invite",
    value: boolean,
  ) => void;

  onRemove: (
    member: WorkspaceMember,
  ) => void;
};

function MemberSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="h-5 w-40 rounded bg-slate-800" />

      <div className="mt-2 h-4 w-56 rounded bg-slate-800" />

      <div className="mt-6 h-10 w-full rounded bg-slate-800" />
    </div>
  );
}

export default function MemberList({
  members,
  loading = false,
  canManage,
  onRoleChange,
  onPermissionChange,
  onRemove,
}: MemberListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <MemberSkeleton />
        <MemberSkeleton />
        <MemberSkeleton />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-12 text-center">
        <h3 className="text-lg font-semibold text-white">
          No team members found
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Invite a team member to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          canManage={canManage}
          onRoleChange={(role) =>
            onRoleChange(member, role)
          }
          onPermissionChange={(
            permission,
            value,
          ) =>
            onPermissionChange(
              member,
              permission,
              value,
            )
          }
          onRemove={() =>
            onRemove(member)
          }
        />
      ))}
    </div>
  );
}