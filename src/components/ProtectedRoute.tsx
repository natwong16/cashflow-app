// ============================================================
// File: src/components/ProtectedRoute.js
//
// Wrap any page with this component to require authentication.
// Redirects unauthenticated users to /login automatically.
//
// Usage:
//   export default function DashboardPage() {
//     return (
//       <ProtectedRoute>
//         <Dashboard />
//       </ProtectedRoute>
//     );
//   }
// ============================================================

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show nothing while checking auth state
  if (loading) {
    return (
      <div style={styles.loading}>
        <p style={styles.text}>Loading...</p>
      </div>
    );
  }

  // User is authenticated — render the page
  if (user) return children;

  // Redirecting — render nothing
  return null;
}

const styles = {
  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: "14px",
    color: "#888",
  },
};
