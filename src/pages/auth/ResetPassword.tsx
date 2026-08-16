import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!password) {
      toast.error("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must be at least 6 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        "Password updated successfully!",
      );

      navigate("/login");
    } catch (error) {
      console.error(
        "Password update error:",
        error,
      );

      toast.error(
        "Unable to update your password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Enter your new WorkspaceGuard password.
          </p>
        </div>

        <form
          onSubmit={handleResetPassword}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter new password"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}