// ============================================================
// File: src/hooks/useAdvice.ts
//
// Calls the /api/advice endpoint and streams Claude's response
// token by token into the `advice` state.
// ============================================================

import { useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export interface CashflowSummary {
  totalIncome: number;
  totalExpenses: number;
  surplus: number;
  savingsRate: number;
  startingBalance: number;
  projectedBalance12m: number;
  currency?: string;
  incomeSourceCount: number;
  expenseItemCount: number;
}

export function useAdvice() {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdvice = useCallback(async (summary: CashflowSummary) => {
    setAdvice("");
    setError(null);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");

      const response = await fetch("/api/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(summary),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as any).error || `Server error ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAdvice((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setAdvice("");
    setError(null);
  }, []);

  return { advice, loading, error, getAdvice, clear };
}
