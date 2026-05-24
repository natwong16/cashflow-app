// ============================================================
// File: src/app/page.js
//
// Root page — redirects to dashboard if logged in,
// otherwise redirects to login.
// Replace the existing src/app/page.js with this file.
// ============================================================

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.push(user ? "/dashboard" : "/login");
    }
  }, [user, loading, router]);

  return null;
}
