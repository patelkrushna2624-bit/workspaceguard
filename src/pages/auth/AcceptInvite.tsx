import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  useEffect(() => {
    async function acceptInvitation() {
      try {
        /*
         * Supabase invitation links contain token_hash.
         */
        const tokenHash =
          searchParams.get("token_hash");

        /*
         * Some Supabase flows may already establish
         * a session before this page loads.
         */
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setReady(true);
          return;
        }

        /*
         * If there is an invitation token, verify it.
         */
        if (tokenHash) {
          const { error } =
            await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: "invite",
            });

          if (error) {
            console.error(
              "Invitation verification error:",
              error,
            );

            toast.error(
              "This invitation is invalid or has expired.",
            );

            navigate("/login", {
              replace: true,
            });

            return;
          }

          setReady(true);
          return;
        }

        /*
         * No token and no session.
         */
        toast.error(
          "No valid invitation was found.",
        );

        navigate("/login", {
          replace: true,
        });
      } catch (error) {
        console.error(
          "Invitation error:",
          error,
        );

        toast.error(
          "Unable to process the invitation.",
        );

        navigate("/login", {
          replace: true,
        });
      } finally {
        setLoading(false);
      }
    }

    acceptInvitation();
  }, [navigate, searchParams]);

  const handleSetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

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

    setSaving(true);

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
        "Account setup complete!",
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Password setup error:",
        error,
      );

      toast.error(
        "Unable to set your password.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-white">
          Accepting invitation...
        </p>
      </div>
    );
  }

  if (!ready) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Join WorkspaceGuard
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Set your password to finish creating
            your account.
          </p>
        </div>

        <form
          onSubmit={handleSetPassword}
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
              placeholder="Enter your password"
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
              placeholder="Confirm your password"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Creating account..."
              : "Complete Account Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}