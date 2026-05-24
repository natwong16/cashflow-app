// ============================================================
// File: src/hooks/useCashflow.ts
//
// Loads all cashflow data from Supabase and exposes actions
// for adding, updating, and deleting items.
//
// Usage:
//   const {
//     incomeItems, expenseItems, profile, summary,
//     loading, addIncome, updateIncome, deleteIncome,
//     addExpense, updateExpense, deleteExpense,
//     updateStartingBalance,
//   } = useCashflow();
// ============================================================

import { useEffect, useState, useCallback } from "react";
import {
  getIncomeItems,
  getExpenseItems,
  getProfile,
  addIncomeItem,
  updateIncomeItem,
  deleteIncomeItem,
  addExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
  updateProfile,
  computeSummary,
  type IncomeItem,
  type ExpenseItem,
  type Profile,
  type Frequency,
} from "../lib/db";

export function useCashflow() {
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------------
  // Load all data on mount
  // ----------------------------------------------------------
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [income, expenses, prof] = await Promise.all([
        getIncomeItems(),
        getExpenseItems(),
        getProfile(),
      ]);
      setIncomeItems(income);
      setExpenseItems(expenses);
      setProfile(prof);
    } catch (err) {
      setError("Failed to load data. Please refresh.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ----------------------------------------------------------
  // Income actions
  // ----------------------------------------------------------
  const addIncome = async (label: string, amount: number, frequency: Frequency) => {
    const item = await addIncomeItem({ label, amount, frequency });
    if (item) setIncomeItems((prev) => [...prev, item]);
  };

  const updateIncome = async (id: string, label: string, amount: number, frequency: Frequency) => {
    const item = await updateIncomeItem(id, { label, amount, frequency });
    if (item) setIncomeItems((prev) => prev.map((i) => (i.id === id ? item : i)));
  };

  const deleteIncome = async (id: string) => {
    const ok = await deleteIncomeItem(id);
    if (ok) setIncomeItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ----------------------------------------------------------
  // Expense actions
  // ----------------------------------------------------------
  const addExpense = async (label: string, amount: number, frequency: Frequency) => {
    const item = await addExpenseItem({ label, amount, frequency });
    if (item) setExpenseItems((prev) => [...prev, item]);
  };

  const updateExpense = async (id: string, label: string, amount: number, frequency: Frequency) => {
    const item = await updateExpenseItem(id, { label, amount, frequency });
    if (item) setExpenseItems((prev) => prev.map((i) => (i.id === id ? item : i)));
  };

  const deleteExpense = async (id: string) => {
    const ok = await deleteExpenseItem(id);
    if (ok) setExpenseItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ----------------------------------------------------------
  // Profile / starting balance
  // ----------------------------------------------------------
  const updateStartingBalance = async (amount: number) => {
    const updated = await updateProfile({ starting_balance: amount });
    if (updated) setProfile(updated);
  };

  // ----------------------------------------------------------
  // Derived summary (recalculated whenever data changes)
  // ----------------------------------------------------------
  const summary = computeSummary(
    incomeItems,
    expenseItems,
    profile?.starting_balance ?? 0
  );

  return {
    // Data
    incomeItems,
    expenseItems,
    profile,
    summary,
    loading,
    error,
    // Income actions
    addIncome,
    updateIncome,
    deleteIncome,
    // Expense actions
    addExpense,
    updateExpense,
    deleteExpense,
    // Profile actions
    updateStartingBalance,
    // Manual refresh
    reload: loadAll,
  };
}
