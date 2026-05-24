// ============================================================
// File: src/lib/db.ts
//
// All database operations for the cashflow app.
// Import and call these functions from your React components.
//
// Usage:
//   import { getIncomeItems, addIncomeItem } from "../lib/db";
// ============================================================

import { supabase } from "./supabaseClient";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
export type Frequency = "monthly" | "weekly" | "fortnightly" | "annual";

export interface IncomeItem {
  id: string;
  user_id: string;
  label: string;
  amount: number;
  frequency: Frequency;
  created_at: string;
  updated_at: string;
}

export interface ExpenseItem {
  id: string;
  user_id: string;
  label: string;
  amount: number;
  frequency: Frequency;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  income_adj: number;
  expense_adj: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  currency: string;
  starting_balance: number;
  created_at: string;
  updated_at: string;
}


// ------------------------------------------------------------
// Profile
// ------------------------------------------------------------

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .single();

  if (error) { console.error("getProfile:", error.message); return null; }
  return data;
}

export async function updateProfile(
  updates: Partial<Pick<Profile, "display_name" | "currency" | "starting_balance">>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .select()
    .single();

  if (error) { console.error("updateProfile:", error.message); return null; }
  return data;
}


// ------------------------------------------------------------
// Income items
// ------------------------------------------------------------

export async function getIncomeItems(): Promise<IncomeItem[]> {
  const { data, error } = await supabase
    .from("income_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) { console.error("getIncomeItems:", error.message); return []; }
  return data ?? [];
}

export async function addIncomeItem(
  item: Pick<IncomeItem, "label" | "amount" | "frequency">
): Promise<IncomeItem | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("income_items")
    .insert({ ...item, user_id: user.id })
    .select()
    .single();

  if (error) { console.error("addIncomeItem:", error.message); return null; }
  return data;
}

export async function updateIncomeItem(
  id: string,
  updates: Partial<Pick<IncomeItem, "label" | "amount" | "frequency">>
): Promise<IncomeItem | null> {
  const { data, error } = await supabase
    .from("income_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) { console.error("updateIncomeItem:", error.message); return null; }
  return data;
}

export async function deleteIncomeItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("income_items")
    .delete()
    .eq("id", id);

  if (error) { console.error("deleteIncomeItem:", error.message); return false; }
  return true;
}


// ------------------------------------------------------------
// Expense items
// ------------------------------------------------------------

export async function getExpenseItems(): Promise<ExpenseItem[]> {
  const { data, error } = await supabase
    .from("expense_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) { console.error("getExpenseItems:", error.message); return []; }
  return data ?? [];
}

export async function addExpenseItem(
  item: Pick<ExpenseItem, "label" | "amount" | "frequency">
): Promise<ExpenseItem | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("expense_items")
    .insert({ ...item, user_id: user.id })
    .select()
    .single();

  if (error) { console.error("addExpenseItem:", error.message); return null; }
  return data;
}

export async function updateExpenseItem(
  id: string,
  updates: Partial<Pick<ExpenseItem, "label" | "amount" | "frequency">>
): Promise<ExpenseItem | null> {
  const { data, error } = await supabase
    .from("expense_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) { console.error("updateExpenseItem:", error.message); return null; }
  return data;
}

export async function deleteExpenseItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("expense_items")
    .delete()
    .eq("id", id);

  if (error) { console.error("deleteExpenseItem:", error.message); return false; }
  return true;
}


// ------------------------------------------------------------
// Scenarios
// ------------------------------------------------------------

export async function getScenarios(): Promise<Scenario[]> {
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) { console.error("getScenarios:", error.message); return []; }
  return data ?? [];
}

export async function addScenario(
  scenario: Pick<Scenario, "name" | "income_adj" | "expense_adj" | "notes">
): Promise<Scenario | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("scenarios")
    .insert({ ...scenario, user_id: user.id })
    .select()
    .single();

  if (error) { console.error("addScenario:", error.message); return null; }
  return data;
}

export async function updateScenario(
  id: string,
  updates: Partial<Pick<Scenario, "name" | "income_adj" | "expense_adj" | "notes">>
): Promise<Scenario | null> {
  const { data, error } = await supabase
    .from("scenarios")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) { console.error("updateScenario:", error.message); return null; }
  return data;
}

export async function deleteScenario(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("scenarios")
    .delete()
    .eq("id", id);

  if (error) { console.error("deleteScenario:", error.message); return false; }
  return true;
}


// ------------------------------------------------------------
// Helper — convert any frequency to a monthly amount
// ------------------------------------------------------------
export function toMonthlyAmount(amount: number, frequency: Frequency): number {
  const multipliers: Record<Frequency, number> = {
    monthly: 1,
    weekly: 52 / 12,
    fortnightly: 26 / 12,
    annual: 1 / 12,
  };
  return amount * multipliers[frequency];
}

// ------------------------------------------------------------
// Helper — compute cashflow summary from items
// ------------------------------------------------------------
export function computeSummary(
  incomeItems: IncomeItem[],
  expenseItems: ExpenseItem[],
  startingBalance: number
) {
  const totalIncome = incomeItems.reduce(
    (sum, item) => sum + toMonthlyAmount(item.amount, item.frequency), 0
  );
  const totalExpenses = expenseItems.reduce(
    (sum, item) => sum + toMonthlyAmount(item.amount, item.frequency), 0
  );
  const surplus = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0;
  const projectedBalance12m = startingBalance + surplus * 12;

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    surplus: Math.round(surplus * 100) / 100,
    savingsRate: Math.round(savingsRate * 10) / 10,
    startingBalance,
    projectedBalance12m: Math.round(projectedBalance12m * 100) / 100,
    incomeSourceCount: incomeItems.length,
    expenseItemCount: expenseItems.length,
  };
}
