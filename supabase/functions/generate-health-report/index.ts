// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import {
  aggregateDailyStats,
  buildDateRange,
  computeCorrelations,
  extractTriggerExposures,
} from "../../../lib/insightsEngine.ts";
import { countRecentReports, fetchBowelEntries, fetchFoodEntries, fetchWaterEntries } from "./db.ts";
import { generateReportText } from "./gemini.ts";

// Proposed in #1/#4 decision record — confirm/tune once real usage data exists.
const LOOKBACK_BUFFER_DAYS = 2;
const RATE_LIMIT_MAX_REPORTS = 5;
const RATE_LIMIT_WINDOW_HOURS = 24;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type RequestBody = { periodStart?: string; periodEnd?: string };

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

/** JSON can't represent Infinity — clamp the lift ratio for jsonb storage / the Gemini payload. */
const LIFT_CLAMP = 999;
function toSerializableCorrelations(correlations: ReturnType<typeof computeCorrelations>) {
  return correlations.map((c) => ({
    ...c,
    lift: Number.isFinite(c.lift) ? c.lift : LIFT_CLAMP,
  }));
}

/** Defensive backstop: the mandatory doctor call-out must appear whenever hasBlood is true,
 *  regardless of how compliant the model's own response is with the prompt instructions. */
function ensureBloodCallout(text: string, hasBlood: boolean): string {
  if (!hasBlood) return text;
  const mentionsMedicalAttention = /doctor|medical (attention|advice|professional)|gp\b|physician/i.test(text);
  if (mentionsMedicalAttention) return text;
  return `${text}\n\n⚠️ Important: blood was recorded in at least one bowel entry during this period. Please see a doctor to get this checked out — this is not something an AI report can assess.`;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return jsonError("Method not allowed", 405);
    }

    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const { periodStart, periodEnd } = body;
    if (!periodStart || !periodEnd || !DATE_RE.test(periodStart) || !DATE_RE.test(periodEnd)) {
      return jsonError("periodStart and periodEnd are required, as YYYY-MM-DD strings", 400);
    }

    const periodStartDate = new Date(`${periodStart}T00:00:00.000Z`);
    const periodEndDate = new Date(`${periodEnd}T00:00:00.000Z`);
    if (Number.isNaN(periodStartDate.getTime()) || Number.isNaN(periodEndDate.getTime())) {
      return jsonError("periodStart and periodEnd must be valid dates", 400);
    }
    if (periodStartDate > periodEndDate) {
      return jsonError("periodStart must be on or before periodEnd", 400);
    }

    const userId = ctx.userClaims!.id;
    const supabase = ctx.supabase; // RLS-scoped to the caller — no service-role key

    // ── Rate limit ─────────────────────────────────────────────────────────
    const recentCount = await countRecentReports(supabase, userId, RATE_LIMIT_WINDOW_HOURS);
    if (recentCount >= RATE_LIMIT_MAX_REPORTS) {
      return jsonError(
        `Rate limit exceeded: max ${RATE_LIMIT_MAX_REPORTS} reports per ${RATE_LIMIT_WINDOW_HOURS}h`,
        429,
      );
    }

    // ── Fetch entries ────────────────────────────────────────────────────────
    // Food/water widened by the lookback buffer so a bowel entry near the period
    // start can still see triggers just before it; bowel entries themselves are
    // scoped strictly to the reported period (they are the outcome events).
    const bufferedStart = new Date(periodStartDate);
    bufferedStart.setUTCDate(bufferedStart.getUTCDate() - LOOKBACK_BUFFER_DAYS);
    const periodEndOfDay = new Date(periodEndDate);
    periodEndOfDay.setUTCHours(23, 59, 59, 999);

    const [foodEntries, waterEntries, bowelEntries] = await Promise.all([
      fetchFoodEntries(supabase, { startISO: bufferedStart.toISOString(), endISO: periodEndOfDay.toISOString() }),
      fetchWaterEntries(supabase, { startISO: bufferedStart.toISOString(), endISO: periodEndOfDay.toISOString() }),
      fetchBowelEntries(supabase, { startISO: periodStartDate.toISOString(), endISO: periodEndOfDay.toISOString() }),
    ]);

    // ── Deterministic stats/correlation layer (never raw entries to the LLM) ──
    const periodDays = Math.round((periodEndDate.getTime() - periodStartDate.getTime()) / 86_400_000) + 1;
    const dates = buildDateRange(periodDays, periodEndDate);

    const daily = aggregateDailyStats(dates, {
      foodEntries: foodEntries as any,
      waterEntries: waterEntries as any,
      bowelEntries,
    });

    const exposures = extractTriggerExposures(foodEntries as any, waterEntries as any);
    const correlations = toSerializableCorrelations(computeCorrelations(bowelEntries, exposures));

    const summaryStats = {
      periodStart,
      periodEnd,
      avgCalories: daily.avgCalories,
      avgWater: daily.avgWater,
      macroAvgs: daily.macroAvgs,
      bowelEntryCount: bowelEntries.length,
      bristolDist: daily.bristolDist,
      avgBristol: daily.avgBristol,
    };

    const hasBlood = bowelEntries.some((e) => e.hasBlood === true);

    // ── AI narrative ───────────────────────────────────────────────────────
    const { text: rawText, model } = await generateReportText({ summaryStats, correlations }, hasBlood);
    const aiReportText = ensureBloodCallout(rawText, hasBlood);

    // ── Persist (immutable snapshot) ─────────────────────────────────────────
    const { data: inserted, error: insertError } = await supabase
      .from("health_reports")
      .insert({
        user_id: userId,
        period_start: periodStart,
        period_end: periodEnd,
        summary_stats: summaryStats,
        correlations,
        ai_report_text: aiReportText,
        model,
      })
      .select()
      .single();

    if (insertError) {
      return jsonError(`Failed to save report: ${insertError.message}`, 500);
    }

    return Response.json({ report: inserted });
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Run `supabase functions serve generate-health-report`
  3. Make an HTTP request with a real user JWT:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-health-report' \
    --header 'apiKey: <SUPABASE_PUBLISHABLE_KEY>' \
    --header 'Authorization: Bearer <UserToken>' \
    --header 'Content-Type: application/json' \
    --data '{"periodStart":"2026-08-01","periodEnd":"2026-08-31"}'

  Set the Gemini secret first: supabase secrets set GEMINI_API_KEY=... --env-file supabase/.env.local
  (or via the Dashboard for the deployed project).
*/
