// ============================================================
// File: src/components/AdvicePanel.tsx
//
// Displays the AI advice panel with a trigger button and
// streaming response. Drop this into your dashboard.
//
// Usage:
//   <AdvicePanel summary={summary} />
// ============================================================

"use client";

import { useAdvice } from "../hooks/useAdvice";
import type { CashflowSummary } from "../hooks/useAdvice";

interface Props {
  summary: CashflowSummary;
}

export default function AdvicePanel({ summary }: Props) {
  const { advice, loading, error, getAdvice, clear } = useAdvice();

  const hasData = summary.incomeSourceCount > 0 || summary.expenseItemCount > 0;

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>AI financial advice</h2>
          <p style={s.subtitle}>
            Personalised guidance based on your cashflow
          </p>
        </div>
        <div style={s.actions}>
          {advice && (
            <button onClick={clear} style={s.clearBtn}>
              Clear
            </button>
          )}
          <button
            onClick={() => getAdvice(summary)}
            disabled={loading || !hasData}
            style={{
              ...s.btn,
              opacity: loading || !hasData ? 0.5 : 1,
              cursor: loading || !hasData ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Analysing..." : advice ? "Refresh advice" : "Get advice"}
          </button>
        </div>
      </div>

      {!hasData && !advice && (
        <p style={s.muted}>
          Add at least one income source or expense to get personalised advice.
        </p>
      )}

      {error && <p style={s.errorText}>{error}</p>}

      {loading && !advice && (
        <div style={s.loadingDots}>
          <span style={s.dot} />
          <span style={{ ...s.dot, animationDelay: "0.2s" }} />
          <span style={{ ...s.dot, animationDelay: "0.4s" }} />
        </div>
      )}

      {advice && (
        <div style={s.adviceBody}>
          {advice.split("\n\n").map((para, i) => (
            <p key={i} style={s.para}>
              {para}
            </p>
          ))}
          {loading && <span style={s.cursor}>▋</span>}
        </div>
      )}

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  panel: {
    background: "#fff",
    border: "0.5px solid #e0e0dc",
    borderRadius: "12px",
    padding: "1.25rem",
    marginTop: "1rem",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "1rem",
    gap: "1rem",
  },
  title: {
    fontSize: "15px",
    fontWeight: 500,
    margin: "0 0 2px",
  },
  subtitle: {
    fontSize: "12px",
    color: "#aaa",
    margin: 0,
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  btn: {
    background: "#fff",
    border: "0.5px solid #ccc",
    borderRadius: "8px",
    padding: "7px 16px",
    fontSize: "13px",
    fontWeight: 500,
  },
  clearBtn: {
    background: "none",
    border: "none",
    fontSize: "13px",
    color: "#aaa",
    cursor: "pointer",
    padding: "7px 8px",
  },
  muted: {
    fontSize: "13px",
    color: "#bbb",
    margin: 0,
  },
  errorText: {
    fontSize: "13px",
    color: "#D85A30",
    margin: 0,
  },
  loadingDots: {
    display: "flex",
    gap: "6px",
    padding: "8px 0",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#ccc",
    display: "inline-block",
    animation: "bounce 1s infinite",
  },
  adviceBody: {
    borderTop: "0.5px solid #f0f0ee",
    paddingTop: "1rem",
  },
  para: {
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#333",
    margin: "0 0 0.75rem",
  },
  cursor: {
    animation: "blink 1s infinite",
    fontSize: "14px",
    color: "#999",
  },
};
