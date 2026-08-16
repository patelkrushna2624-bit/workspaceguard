import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold">
          WorkspaceGuard
        </h1>

        <p className="text-sm text-gray-500">
          {user?.email ?? ""}
        </p>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Logout
      </button>
    </header>
  );
}