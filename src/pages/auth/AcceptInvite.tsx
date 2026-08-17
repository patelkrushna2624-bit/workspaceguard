
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

export default function AcceptInvite() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let mounted = true;

    async function setupInvitation() {
      try {
        /*
         * Supabase may establish the session automatically
         * when the invitation link is opened.
         */
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          if (mounted) {
            setReady(true);
            setLoading(false);
          }
          return;
        }

        /*
         * Listen for the authentication event generated
         * by the invitation/recovery link.
         */
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log("AUTH EVENT:", event);

            if (
              newSession?.user &&
              (event === "SIGNED_IN" ||
                event === "INITIAL_SESSION" ||
                event === "PASSWORD_RECOVERY")
            ) {
              if (mounted) {
                setReady(true);
                setLoading(false);
              }
            }
          },
        );

        /*
         * Give Supabase a moment to process the
         * invitation URL.
         */
        setTimeout(async () => {
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();

          if (currentSession?.user) {
            if (mounted) {
              setReady(true);
              setLoading(false);
            }
          } else {
            if (mounted) {
              setLoading(false);
              toast.error(
                "This invitation is invalid or has expired.",
              );
            }
          }

          subscription.unsubscribe();
        }, 1500);
      } catch (error) {
        console.error("Invitation error:", error);

        if (mounted) {
          setLoading(false);
          toast.error(
            "Unable to process the invitation.",
          );
        }
      }
    }

    setupInvitation();

    return () => {
      mounted = false;
    };
  }, []);

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
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error(
          "PASSWORD UPDATE ERROR:",
          error,
        );

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="rounded-xl bg-slate-900 p-8 text-center">
          <h1 className="text-xl font-bold text-white">
            Invitation could not be opened
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Please request a new invitation.
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
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
