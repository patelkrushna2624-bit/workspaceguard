import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AcceptInvite() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkInvitation = async () => {
      try {
        setError("");

        // Give Supabase a moment to process the invitation URL.
        await new Promise((resolve) => setTimeout(resolve, 500));

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(sessionError);
          setError("Unable to verify the invitation.");
          setLoading(false);
          return;
        }

        if (!session) {
          setError(
            "This invitation is invalid or has expired. Please request a new invitation."
          );
          setLoading(false);
          return;
        }

        setReady(true);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while opening the invitation.");
        setLoading(false);
      }
    };

    checkInvitation();
  }, []);

  const handleSetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError(
          "Your invitation session has expired. Please request a new invitation."
        );
        setSaving(false);
        return;
      }

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        console.error(updateError);
        setError(updateError.message);
        setSaving(false);
        return;
      }

      // Password successfully created.
      // The invited user is now a normal authenticated user.
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Unable to create your password.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
          color: "white",
          fontSize: "20px",
        }}
      >
        Checking invitation...
      </div>
    );
  }

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            background: "#111827",
            padding: "40px",
            borderRadius: "16px",
            color: "white",
          }}
        >
          <h1>Invitation Error</h1>

          <p
            style={{
              color: "#f87171",
              marginTop: "15px",
            }}
          >
            {error}
          </p>

          <button
            onClick={() => navigate("/login")}
            style={{
              marginTop: "20px",
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#111827",
          padding: "40px",
          borderRadius: "16px",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "10px",
          }}
        >
          Accept Invitation
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: "30px",
          }}
        >
          Welcome to WorkspaceGuard. Create a password to finish
          setting up your account.
        </p>

        {error && (
          <div
            style={{
              background: "#450a0a",
              color: "#fca5a5",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSetPassword}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            New Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            required
            minLength={6}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #334155",
              background: "#1e293b",
              color: "white",
              fontSize: "16px",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            placeholder="Confirm your password"
            required
            minLength={6}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              marginBottom: "25px",
              borderRadius: "8px",
              border: "1px solid #334155",
              background: "#1e293b",
              color: "white",
              fontSize: "16px",
            }}
          />

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              background: saving ? "#475569" : "#2563eb",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving
              ? "Creating account..."
              : "Create Password & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}