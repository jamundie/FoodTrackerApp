// Gemini Vision call for meal-photo analysis. Key comes from the GEMINI_API_KEY Edge Function
// secret — never EXPO_PUBLIC_* — so it is not extractable from the app bundle (TDR-021 gap).
const MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are a nutrition analysis assistant. Analyse the meal photo and identify each distinct ingredient or food item visible.

Return ONLY a JSON array — no markdown, no explanation, no code fences. Each element must have:
- "name": string — the ingredient or food item name
- "estimatedWeightG": number — estimated weight in grams (your best guess for a typical serving)
- "caloriesPer100g": number — approximate kcal per 100g
- "proteinPer100g": number — approximate grams of protein per 100g
- "carbsPer100g": number — approximate grams of carbohydrates per 100g
- "fatPer100g": number — approximate grams of fat per 100g
- "fiberPer100g": number — approximate grams of dietary fibre per 100g

Be as accurate as possible using standard nutritional values. If you cannot confidently identify an item, omit it. Return an empty array [] if no food is visible.

Example output:
[
  {"name":"Chicken breast","estimatedWeightG":150,"caloriesPer100g":165,"proteinPer100g":31,"carbsPer100g":0,"fatPer100g":3.6,"fiberPer100g":0},
  {"name":"Brown rice","estimatedWeightG":180,"caloriesPer100g":112,"proteinPer100g":2.6,"carbsPer100g":23,"fatPer100g":0.9,"fiberPer100g":1.8}
]`;

export type DetectedIngredient = {
  name: string;
  estimatedWeightG: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message: string; code: number };
};

/** Strip markdown fences if the model ignores the "no fences" instruction. */
function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function parseIngredients(text: string): DetectedIngredient[] {
  try {
    const parsed = JSON.parse(stripFences(text));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is DetectedIngredient =>
        typeof item?.name === "string" && typeof item?.caloriesPer100g === "number",
    );
  } catch {
    return [];
  }
}

export async function analyseMealImage(imageBase64: string, mimeType: string): Promise<DetectedIngredient[]> {
  const apiKey = Deno.env.get("GEMINI_API_KEY") ?? "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY secret is not configured. Run: supabase secrets set GEMINI_API_KEY=...");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: SYSTEM_PROMPT }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] },
      ],
      // thinkingBudget: 0 stops 2.5 Flash's thinking tokens eating maxOutputTokens and truncating the JSON array
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });

  const json: GeminiResponse = await response.json();
  if (!response.ok || json.error) {
    throw new Error(json.error?.message ?? `Gemini API error ${response.status}`);
  }

  return parseIngredients(json.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
}
