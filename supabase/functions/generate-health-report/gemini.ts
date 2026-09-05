// Gemini text generation for the health report narrative.
// Mirrors the REST call shape used by lib/geminiService.ts (vision, client-side),
// but this is a text-only prompt and the key is read from an Edge Function secret
// (GEMINI_API_KEY) — never EXPO_PUBLIC_* — closing the gap flagged in TDR-021.
const MODEL = "gemini-2.5-flash";

const SAFETY_FRAMING = `IMPORTANT — include all of the following in your response, worded naturally:
- This report is not medical advice. It highlights statistical patterns only.
- Correlation does not imply causation — an observed pattern does not mean a food or drink caused a symptom.
- If the data includes any bowel entry with blood present, you MUST clearly recommend the user see a doctor, regardless of how you would otherwise phrase the report. This call-out is mandatory and must not be downplayed or omitted.`;

function buildPrompt(payload: unknown, hasBlood: boolean): string {
  return `You are a health-tracking assistant writing a short, friendly report for a user reviewing their own food, water, and bowel-movement data over a period of time.

You are given a pre-computed JSON summary of statistics and correlations — never raw entry logs. Do not invent data outside this payload. Do not attempt to compute your own correlations; only narrate the ones provided.

${SAFETY_FRAMING}

${hasBlood ? "NOTE: This period's data includes at least one bowel entry with blood present. The doctor call-out above is required in your response." : ""}

Write a concise report (roughly 150-300 words) covering:
1. A brief summary of the period (calorie/water averages, bowel health overview)
2. Any notable correlations from the data, described in plain language with the appropriate caveats
3. The mandatory safety framing above

Data:
${JSON.stringify(payload)}`;
}

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message: string; code: number };
};

/** Generates the AI report text from a compact stats/correlation payload. Never receives raw entries. */
export async function generateReportText(
  payload: unknown,
  hasBlood: boolean,
): Promise<{ text: string; model: string }> {
  const apiKey = Deno.env.get("GEMINI_API_KEY") ?? "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY secret is not configured. Run: supabase secrets set GEMINI_API_KEY=...");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(payload, hasBlood) }] }],
      // thinkingBudget: 0 disables 2.5 Flash's internal "thinking" tokens, which
      // otherwise eat into maxOutputTokens and can truncate the visible report text.
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  const json: GeminiResponse = await response.json();

  if (!response.ok || json.error) {
    throw new Error(json.error?.message ?? `Gemini API error ${response.status}`);
  }

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("Gemini returned an empty report");

  return { text, model: MODEL };
}
