// ============================================================
// File: src/app/api/advice/route.ts
//
// Server-side API route — authenticates the user, calls Claude,
// and streams the response back. The Anthropic API key never
// reaches the browser.
//
// Required environment variables in .env.local:
//   ANTHROPIC_API_KEY=sk-ant-...
//   SUPABASE_URL=https://your-project.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=eyJ...
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Summary {
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

function validateSummary(body: any): Summary | null {
  const {
    totalIncome, totalExpenses, surplus, savingsRate,
    startingBalance, projectedBalance12m,
    currency = "GBP", incomeSourceCount, expenseItemCount,
  } = body;

  if (
    typeof totalIncome !== "number" ||
    typeof totalExpenses !== "number" ||
    typeof surplus !== "number" ||
    typeof projectedBalance12m !== "number"
  ) return null;

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    surplus: Math.round(surplus * 100) / 100,
    savingsRate: Math.round((savingsRate ?? 0) * 10) / 10,
    startingBalance: Math.round((startingBalance ?? 0) * 100) / 100,
    projectedBalance12m: Math.round(projectedBalance12m * 100) / 100,
    currency,
    incomeSourceCount: incomeSourceCount ?? 0,
    expenseItemCount: expenseItemCount ?? 0,
  };
}

function buildPrompt(s: Summary): string {
  const sym = s.currency === "GBP" ? "£" : s.currency === "USD" ? "$" : "€";
  const fmt = (n: number) =>
    `${sym}${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`;

  return `You are a friendly, practical personal finance advisor. A user has shared their monthly cashflow summary. Give clear, actionable advice — be specific, encouraging where warranted, and honest about risks.

## Their cashflow summary
- Monthly income: ${fmt(s.totalIncome)} (${s.incomeSourceCount} source${s.incomeSourceCount !== 1 ? "s" : ""})
- Monthly expenses: ${fmt(s.totalExpenses)} (${s.expenseItemCount} item${s.expenseItemCount !== 1 ? "s" : ""})
- Monthly surplus: ${s.surplus >= 0 ? fmt(s.surplus) : "-" + fmt(s.surplus)}
- Savings rate: ${s.savingsRate}%
- Current balance: ${fmt(s.startingBalance)}
- Projected balance in 12 months: ${s.projectedBalance12m >= 0 ? fmt(s.projectedBalance12m) : "-" + fmt(s.projectedBalance12m)}

## Instructions
- Keep your response to 3–5 short paragraphs. No bullet lists — use plain conversational prose.
- Lead with the most important insight (positive or negative).
- Give at least one specific, concrete action they can take this week.
- If the surplus or 12-month balance is negative, treat this as urgent.
- If the savings rate is below 10%, flag it clearly.
- If the savings rate is above 20%, acknowledge it and suggest next steps (emergency fund, investing).
- Do not ask for more information. Work with what you have.
- Do not mention that you are an AI.`;
}

export async function POST(request: Request) {
  // 1. Authenticate
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const { data: { user }, error: authError } =
    await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  // 2. Validate body
  let body: any;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const summary = validateSummary(body);
  if (!summary) {
    return Response.json({ error: "Invalid summary data" }, { status: 400 });
  }

  // 3. Stream Claude's response
  const encoder = new TextEncoder();
  let fullAdvice = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = await anthropic.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 600,
          messages: [{ role: "user", content: buildPrompt(summary) }],
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullAdvice += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        // 4. Log to Supabase
        await supabaseAdmin.from("advice_log").insert({
          user_id: user.id,
          summary,
          advice: fullAdvice,
        });

        controller.close();
      } catch (err) {
        console.error("Advice route error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
