"use client";
// Admin Login Page — /admin/login
// Firebase email/password authentication
import { useState, useEffect, FormEvent } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // If already logged in, skip straight to admin
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/admin");
      } else {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/admin");
    } catch (err: unknown) {
      let msg = "Login failed. Please try again.";
      if (err instanceof Error) {
        // Map Firebase error codes to readable messages
        const code = (err as { code?: string }).code ?? "";
        if (
          code.includes("invalid-credential") ||
          code.includes("wrong-password") ||
          code.includes("user-not-found") ||
          code.includes("invalid-email")
        ) {
          msg = "Invalid email or password. Check your credentials.";
        } else if (code.includes("too-many-requests")) {
          msg = "Too many failed attempts. Try again later.";
        } else if (code.includes("network-request-failed")) {
          msg = "Network error. Check your internet connection.";
        } else if (code.includes("user-disabled")) {
          msg = "This account has been disabled.";
        } else {
          msg = err.message;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 56px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
        }}
      >
        Checking session...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#111827",
          border: "1px solid #1e293b",
          borderRadius: 16,
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontSize: "2rem" }}>🔐</p>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#f1f5f9",
              marginBottom: "0.25rem",
            }}
          >
            Admin Login
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Sign in to manage the tournament
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                color: "#94a3b8",
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: "0.4rem",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                color: "#94a3b8",
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: "0.4rem",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: 8,
                padding: "0.75rem 1rem",
                color: "#ef4444",
                fontSize: "0.875rem",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            id="login-btn"
            type="submit"
            className="btn btn-success"
            disabled={loading || !email || !password}
            style={{
              width: "100%",
              padding: "0.75rem",
              marginTop: "0.5rem",
              opacity: loading ? 0.7 : 1,
              fontSize: "1rem",
            }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#475569",
            lineHeight: 1.6,
          }}
        >
          Make sure you have created an admin user in Firebase Console
          under Authentication → Users.
        </p>
      </div>
    </div>
  );
}
