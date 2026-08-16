type PermissionSwitchesProps = {
  canEdit: boolean;
  canDelete: boolean;
  canInvite: boolean;

  disabled?: boolean;

  onChange: (
    permission:
      | "can_edit"
      | "can_delete"
      | "can_invite",
    value: boolean,
  ) => void;
};

type PermissionItemProps = {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
};

function PermissionItem({
  label,
  checked,
  disabled,
  onChange,
}: PermissionItemProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
      />

      <span>{label}</span>
    </label>
  );
}

export default function PermissionSwitches({
  canEdit,
  canDelete,
  canInvite,
  disabled = false,
  onChange,
}: PermissionSwitchesProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <PermissionItem
        label="Can Edit"
        checked={canEdit}
        disabled={disabled}
        onChange={(value) =>
          onChange("can_edit", value)
        }
      />

      <PermissionItem
        label="Can Delete"
        checked={canDelete}
        disabled={disabled}
        onChange={(value) =>
          onChange("can_delete", value)
        }
      />

      <PermissionItem
        label="Can Invite"
        checked={canInvite}
        disabled={disabled}
        onChange={(value) =>
          onChange("can_invite", value)
        }
      />
    </div>
  );
}