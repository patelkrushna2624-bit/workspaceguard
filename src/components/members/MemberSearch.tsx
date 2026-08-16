type MemberSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function MemberSearch({
  value,
  onChange,
}: MemberSearchProps) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Search members by name or email..."
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
      />
    </div>
  );
}