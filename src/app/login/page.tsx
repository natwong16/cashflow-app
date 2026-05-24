// ============================================================
// File: src/app/login/page.js
//
// Login page — handles both sign in and sign up in one form.
// Redirects to /dashboard after successful auth.
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        setMessage(
          "Account created! Check your email to confirm your address, then sign in."
        );
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        router.push("/dashboard");
      }
    }

    setLoading(false);
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Cashflow App</h1>
        <p style={styles.subtitle}>
          {mode === "signin" ? "Sign in to your account" : "Create an account"}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            minLength={6}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading
              ? "Please wait..."
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <p style={styles.toggle}>
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button style={styles.link} onClick={() => setMode("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button style={styles.link} onClick={() => setMode("signin")}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f8",
    padding: "1rem",
  },
  card: {
    background: "#fff",
    border: "0.5px solid #e0e0dc",
    borderRadius: "12px",
    padding: "2rem",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "500",
    margin: "0 0 4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    margin: "0 0 1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    color: "#555",
    marginBottom: "2px",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "0.5px solid #ccc",
    fontSize: "14px",
    marginBottom: "8px",
    outline: "none",
  },
  button: {
    marginTop: "8px",
    padding: "10px",
    borderRadius: "8px",
    border: "0.5px solid #ccc",
    background: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  error: {
    fontSize: "13px",
    color: "#D85A30",
    margin: "4px 0",
  },
  success: {
    fontSize: "13px",
    color: "#1D9E75",
    margin: "4px 0",
  },
  toggle: {
    fontSize: "13px",
    color: "#888",
    textAlign: "center",
    marginTop: "1.5rem",
  },
  link: {
    background: "none",
    border: "none",
    color: "#378ADD",
    cursor: "pointer",
    fontSize: "13px",
    padding: 0,
    textDecoration: "underline",
  },
};
