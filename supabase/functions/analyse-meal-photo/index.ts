// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

import { analyseMealImage } from "./gemini.ts";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
// ~10 MB of base64 — well above a quality-0.8 phone photo, low enough to stop abuse
const MAX_BASE64_CHARS = 14_000_000;

type RequestBody = { imageBase64?: string; mimeType?: string };

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req) => {
    if (req.method !== "POST") {
      return jsonError("Method not allowed", 405);
    }

    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const { imageBase64, mimeType } = body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return jsonError("imageBase64 is required", 400);
    }
    if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
      return jsonError("mimeType must be one of: image/jpeg, image/png, image/webp, image/gif", 400);
    }
    if (imageBase64.length > MAX_BASE64_CHARS) {
      return jsonError("Image is too large", 413);
    }

    // Uncaught throws (Gemini failures) would otherwise surface as an opaque non-JSON 500
    try {
      const ingredients = await analyseMealImage(imageBase64, mimeType);
      return Response.json({ ingredients });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("analyse-meal-photo failed:", message);
      return jsonError(message, 500);
    }
  }),
};
