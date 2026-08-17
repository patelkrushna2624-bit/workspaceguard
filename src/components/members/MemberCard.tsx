import type { WorkspaceMember } from "../../hooks/useMembers";

import RoleSelector from "./RoleSelector";
import PermissionSwitches from "./PermissionSwitches";

type MemberCardProps = {
  member: WorkspaceMember;
  canManage: boolean;

  onRoleChange: (
    role: WorkspaceMember["role"],
  ) => void;

  onPermissionChange: (
    permission:
      | "can_edit"
      | "can_delete"
      | "can_invite",
    value: boolean,
  ) => void;

  onRemove: () => void;
};

function Header({
  member,
}: {
  member: WorkspaceMember;
}) {
  return (
    <div>
      <h3 className="font-semibold text-white">
        {member.profile?.full_name || "Unknown User"}
      </h3>

      <p className="mt-1 text-sm text-slate-400">
        {member.profile?.email || "No email"}
      </p>

      {/* Explicit role display */}
      <p className="mt-2 text-sm text-slate-300">
        Role:{" "}
        <span className="font-semibold capitalize text-blue-400">
          {member.role || "viewer"}
        </span>
      </p>
    </div>
  );
}

function Roles({
  member,
  canManage,
  onRoleChange,
}: {
  member: WorkspaceMember;
  canManage: boolean;

  onRoleChange: (
    role: WorkspaceMember["role"],
  ) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Role
      </p>

      <RoleSelector
        role={member.role || "viewer"}
        disabled={!canManage}
        onChange={onRoleChange}
      />
    </div>
  );
}

function Permissions({
  member,
  canManage,
  onPermissionChange,
}: {
  member: WorkspaceMember;
  canManage: boolean;

  onPermissionChange: (
    permission:
      | "can_edit"
      | "can_delete"
      | "can_invite",
    value: boolean,
  ) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Permissions
      </p>

      <PermissionSwitches
        canEdit={member.can_edit}
        canDelete={member.can_delete}
        canInvite={member.can_invite}
        disabled={!canManage}
        onChange={onPermissionChange}
      />
    </div>
  );
}

function Actions({
  canManage,
  onRemove,
}: {
  canManage: boolean;
  onRemove: () => void;
}) {
  if (!canManage) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onRemove}
      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
    >
      Remove
    </button>
  );
}

function MemberCard({
  member,
  canManage,
  onRoleChange,
  onPermissionChange,
  onRemove,
}: MemberCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col gap-5">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <Header member={member} />

          <Actions
            canManage={canManage}
            onRemove={onRemove}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">

          <Roles
            member={member}
            canManage={canManage}
            onRoleChange={onRoleChange}
          />

          <Permissions
            member={member}
            canManage={canManage}
            onPermissionChange={onPermissionChange}
          />

        </div>
      </div>
    </div>
  );
}

MemberCard.Header = Header;
MemberCard.Roles = Roles;
MemberCard.Permissions = Permissions;
MemberCard.Actions = Actions;

export default MemberCard;