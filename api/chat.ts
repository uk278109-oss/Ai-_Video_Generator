import type { VercelRequest, VercelResponse } from "@vercel/node";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
type RequestBody = { message?: string; messages?: ChatMessage[]; history?: ChatMessage[]; provider?: "auto" | "gemini" | "grok" };

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
const XAI_MODEL = process.env.XAI_TEXT_MODEL || "grok-4-1-fast-reasoning";
const SYSTEM_PROMPT = `You are DOG AI, a helpful AI assistant. For coding requests, provide accurate working code and brief explanations. Use markdown code blocks. Never mention internal providers, APIs, routing, or environment variables.`;

function normalize(body: RequestBody): ChatMessage[] {
  const source = Array.isArray(body.messages) && body.messages.length ? body.messages : body.history;
  if (Array.isArray(source) && source.length) return source.filter(m => m && typeof m.content === "string" && ["user", "assistant", "system"].includes(m.role)).slice(-20);
  if (typeof body.message === "string" && body.message.trim()) return [{ role: "user", content: body.message.trim() }];
  return [];
}

async function gemini(messages: ChatMessage[]) {
  if (!GEMINI_API_KEY) throw new Error("Gemini is not configured on the server.");
  const contents = messages.filter(m => m.role !== "system").map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents, generationConfig: { temperature: 0.4, maxOutputTokens: 8192 } })
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${d?.error?.message || "Request failed"}`);
  const text = d?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
  if (!text.trim()) throw new Error("Gemini returned an empty response.");
  return text;
}

async function grok(messages: ChatMessage[]) {
  if (!XAI_API_KEY) throw new Error("Grok is not configured on the server.");
  const r = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${XAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: XAI_MODEL, messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== "system")], temperature: 0.4, max_tokens: 8192 })
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`Grok ${r.status}: ${d?.error?.message || d?.error?.code || "Request failed"}`);
  const text = d?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("Grok returned an empty response.");
  return text;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const body = (req.body || {}) as RequestBody;
    const messages = normalize(body);
    if (!messages.length) return res.status(400).json({ ok: false, error: "A message is required." });
    const provider = body.provider || "auto";
    if (provider === "gemini") return res.status(200).json({ ok: true, provider: "gemini", model: GEMINI_MODEL, text: await gemini(messages) });
    if (provider === "grok") return res.status(200).json({ ok: true, provider: "grok", model: XAI_MODEL, text: await grok(messages) });
    try { return res.status(200).json({ ok: true, provider: "gemini", model: GEMINI_MODEL, text: await gemini(messages) }); }
    catch (e) {
      const geminiError = e instanceof Error ? e.message : String(e);
      try { return res.status(200).json({ ok: true, provider: "grok", model: XAI_MODEL, text: await grok(messages) }); }
      catch (x) { return res.status(502).json({ ok: false, error: "DOG AI could not get a response.", details: { gemini: geminiError, grok: x instanceof Error ? x.message : String(x) } }); }
    }
  } catch (e) { return res.status(500).json({ ok: false, error: e instanceof Error ? e.message : "Unexpected server error" }); }
}
