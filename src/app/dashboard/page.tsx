// ============================================================
// File: src/app/dashboard/page.tsx
//
// Full dashboard with income, expenses, metrics, and AI advice.
// Replace your existing src/app/dashboard/page.tsx with this.
// ============================================================

"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCashflow } from "../../hooks/useCashflow";
import AdvicePanel from "../../components/AdvicePanel";
import type { Frequency } from "../../lib/db";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const {
    incomeItems, expenseItems, profile, summary, loading, error,
    addIncome, updateIncome, deleteIncome,
    addExpense, updateExpense, deleteExpense,
    updateStartingBalance,
  } = useCashflow();

  const [newIncomeLabel, setNewIncomeLabel] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [newIncomeFreq, setNewIncomeFreq] = useState<Frequency>("monthly");

  const [newExpenseLabel, setNewExpenseLabel] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseFreq, setNewExpenseFreq] = useState<Frequency>("monthly");

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleAddIncome = async () => {
    if (!newIncomeLabel || !newIncomeAmount) return;
    await addIncome(newIncomeLabel, parseFloat(newIncomeAmount), newIncomeFreq);
    setNewIncomeLabel(""); setNewIncomeAmount(""); setNewIncomeFreq("monthly");
  };

  const handleAddExpense = async () => {
    if (!newExpenseLabel || !newExpenseAmount) return;
    await addExpense(newExpenseLabel, parseFloat(newExpenseAmount), newExpenseFreq);
    setNewExpenseLabel(""); setNewExpenseAmount(""); setNewExpenseFreq("monthly");
  };

  const fmt = (n: number) => "£" + Math.round(Math.abs(n)).toLocaleString("en-GB");

  return (
    <main style={s.page}>
      <header style={s.header}>
        <h1 style={s.title}>Cashflow App</h1>
        <div style={s.headerRight}>
          <span style={s.email}>{user?.email}</span>
          <button onClick={handleSignOut} style={s.btn}>Sign out</button>
        </div>
      </header>

      <div style={s.content}>
        {loading && <p style={s.muted}>Loading your data...</p>}
        {error && <p style={s.errorText}>{error}</p>}

        {!loading && (
          <>
            {/* Metrics */}
            <div style={s.metricGrid}>
              <div style={s.metric}>
                <p style={s.metricLabel}>Monthly income</p>
                <p style={{ ...s.metricValue, color: "#1D9E75" }}>{fmt(summary.totalIncome)}</p>
              </div>
              <div style={s.metric}>
                <p style={s.metricLabel}>Monthly expenses</p>
                <p style={{ ...s.metricValue, color: "#D85A30" }}>{fmt(summary.totalExpenses)}</p>
              </div>
              <div style={s.metric}>
                <p style={s.metricLabel}>Monthly surplus</p>
                <p style={{ ...s.metricValue, color: summary.surplus >= 0 ? "#1D9E75" : "#D85A30" }}>
                  {summary.surplus < 0 ? "-" : ""}{fmt(summary.surplus)}
                </p>
              </div>
              <div style={s.metric}>
                <p style={s.metricLabel}>Savings rate</p>
                <p style={{ ...s.metricValue, color: summary.savingsRate >= 20 ? "#1D9E75" : summary.savingsRate >= 10 ? "#555" : "#D85A30" }}>
                  {summary.savingsRate.toFixed(1)}%
                </p>
              </div>
              <div style={s.metric}>
                <p style={s.metricLabel}>Balance in 12 months</p>
                <p style={{ ...s.metricValue, color: summary.projectedBalance12m >= 0 ? "#1D9E75" : "#D85A30" }}>
                  {summary.projectedBalance12m < 0 ? "-" : ""}{fmt(summary.projectedBalance12m)}
                </p>
              </div>
              <div style={s.metric}>
                <p style={s.metricLabel}>Starting balance</p>
                <input
                  type="number"
                  defaultValue={profile?.starting_balance ?? 0}
                  onBlur={(e) => updateStartingBalance(parseFloat(e.target.value) || 0)}
                  style={s.balanceInput}
                />
              </div>
            </div>

            {/* Income + Expenses */}
            <div style={s.twoCol}>
              <div style={s.panel}>
                <h2 style={s.panelTitle}>Income</h2>
                {incomeItems.length === 0 && <p style={s.muted}>No income sources yet.</p>}
                {incomeItems.map((item) => (
                  <div key={item.id} style={s.row}>
                    <input defaultValue={item.label} onBlur={(e) => updateIncome(item.id, e.target.value, item.amount, item.frequency)} style={s.rowInput} placeholder="Label" />
                    <input type="number" defaultValue={item.amount} onBlur={(e) => updateIncome(item.id, item.label, parseFloat(e.target.value) || 0, item.frequency)} style={s.rowAmount} />
                    <select defaultValue={item.frequency} onChange={(e) => updateIncome(item.id, item.label, item.amount, e.target.value as Frequency)} style={s.rowSelect}>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="annual">Annual</option>
                    </select>
                    <button onClick={() => deleteIncome(item.id)} style={s.deleteBtn}>✕</button>
                  </div>
                ))}
                <div style={{ ...s.row, marginTop: "12px" }}>
                  <input value={newIncomeLabel} onChange={(e) => setNewIncomeLabel(e.target.value)} placeholder="Label" style={s.rowInput} />
                  <input type="number" value={newIncomeAmount} onChange={(e) => setNewIncomeAmount(e.target.value)} placeholder="Amount" style={s.rowAmount} />
                  <select value={newIncomeFreq} onChange={(e) => setNewIncomeFreq(e.target.value as Frequency)} style={s.rowSelect}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="annual">Annual</option>
                  </select>
                  <button onClick={handleAddIncome} style={s.addBtn}>+</button>
                </div>
              </div>

              <div style={s.panel}>
                <h2 style={s.panelTitle}>Expenses</h2>
                {expenseItems.length === 0 && <p style={s.muted}>No expenses yet.</p>}
                {expenseItems.map((item) => (
                  <div key={item.id} style={s.row}>
                    <input defaultValue={item.label} onBlur={(e) => updateExpense(item.id, e.target.value, item.amount, item.frequency)} style={s.rowInput} placeholder="Label" />
                    <input type="number" defaultValue={item.amount} onBlur={(e) => updateExpense(item.id, item.label, parseFloat(e.target.value) || 0, item.frequency)} style={s.rowAmount} />
                    <select defaultValue={item.frequency} onChange={(e) => updateExpense(item.id, item.label, item.amount, e.target.value as Frequency)} style={s.rowSelect}>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="fortnightly">Fortnightly</option>
                      <option value="annual">Annual</option>
                    </select>
                    <button onClick={() => deleteExpense(item.id)} style={s.deleteBtn}>✕</button>
                  </div>
                ))}
                <div style={{ ...s.row, marginTop: "12px" }}>
                  <input value={newExpenseLabel} onChange={(e) => setNewExpenseLabel(e.target.value)} placeholder="Label" style={s.rowInput} />
                  <input type="number" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} placeholder="Amount" style={s.rowAmount} />
                  <select value={newExpenseFreq} onChange={(e) => setNewExpenseFreq(e.target.value as Frequency)} style={s.rowSelect}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="annual">Annual</option>
                  </select>
                  <button onClick={handleAddExpense} style={s.addBtn}>+</button>
                </div>
              </div>
            </div>

            {/* AI Advice */}
            <AdvicePanel summary={summary} />
          </>
        )}
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", backgroundColor: "#f9f9f8" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2rem", background: "#fff", borderBottom: "0.5px solid #e0e0dc" },
  title: { fontSize: "18px", fontWeight: 500, margin: 0 },
  headerRight: { display: "flex", alignItems: "center", gap: "1rem" },
  email: { fontSize: "13px", color: "#888" },
  btn: { background: "none", border: "0.5px solid #ccc", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", cursor: "pointer" },
  content: { maxWidth: "960px", margin: "0 auto", padding: "2rem" },
  metricGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "1.5rem" },
  metric: { background: "#fff", border: "0.5px solid #e0e0dc", borderRadius: "10px", padding: "1rem" },
  metricLabel: { fontSize: "12px", color: "#888", margin: "0 0 4px" },
  metricValue: { fontSize: "22px", fontWeight: 500, margin: 0 },
  balanceInput: { fontSize: "18px", fontWeight: 500, border: "none", borderBottom: "0.5px solid #ccc", outline: "none", width: "100%", background: "transparent", padding: "2px 0" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  panel: { background: "#fff", border: "0.5px solid #e0e0dc", borderRadius: "12px", padding: "1.25rem" },
  panelTitle: { fontSize: "15px", fontWeight: 500, margin: "0 0 12px" },
  row: { display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" },
  rowInput: { flex: 1.5, minWidth: 0, fontSize: "13px", padding: "6px 8px", borderRadius: "6px", border: "0.5px solid #ddd" },
  rowAmount: { flex: 1, minWidth: 0, fontSize: "13px", padding: "6px 8px", borderRadius: "6px", border: "0.5px solid #ddd" },
  rowSelect: { flex: 1, minWidth: 0, fontSize: "13px", padding: "6px 4px", borderRadius: "6px", border: "0.5px solid #ddd" },
  deleteBtn: { background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "14px", padding: "4px 6px", borderRadius: "6px", flexShrink: 0 },
  addBtn: { background: "none", border: "0.5px solid #ccc", borderRadius: "6px", padding: "4px 10px", fontSize: "16px", cursor: "pointer", flexShrink: 0 },
  muted: { fontSize: "13px", color: "#aaa", margin: "0 0 8px" },
  errorText: { fontSize: "13px", color: "#D85A30", margin: "0 0 8px" },
};
