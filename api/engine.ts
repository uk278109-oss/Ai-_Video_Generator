import type { VercelRequest, VercelResponse } from "@vercel/node";

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };
type RequestBody = { message?: string; messages?: ChatMessage[]; history?: ChatMessage[] };

const SYSTEM_PROMPT = `You are DOG, a helpful AI assistant. For coding requests, provide accurate working code and brief explanations. Use markdown code blocks. Never mention internal providers, APIs, routing, model names, or environment variables.`;

function normalize(body: RequestBody): ChatMessage[] {
  const source = Array.isArray(body.messages) && body.messages.length ? body.messages : body.history;
  if (Array.isArray(source) && source.length) {
    return source
      .filter((m) => m && typeof m.content === "string" && ["user", "assistant", "system"].includes(m.role))
      .slice(-20);
  }
  if (typeof body.message === "string" && body.message.trim()) {
    return [{ role: "user", content: body.message.trim() }];
  }
  return [];
}

function messagesForOpenAI(messages: ChatMessage[]) {
  return [{ role: "system", content: SYSTEM_PROMPT }, ...messages.filter((m) => m.role !== "system")];
}

async function openAICompatible(messages: ChatMessage[]) {
  const baseUrl = process.env.DOG_ENGINE_BASE_URL?.trim();
  const apiKey = process.env.DOG_ENGINE_API_KEY?.trim();
  const model = process.env.DOG_ENGINE_MODEL?.trim();

  if (!baseUrl || !model) throw new Error("DOG Engine model endpoint is not configured.");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const r = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: messagesForOpenAI(messages),
      temperature: 0.4,
      max_tokens: 8192,
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`DOG Engine ${r.status}: ${d?.error?.message || "Request failed"}`);
  const text = d?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("DOG Engine returned an empty response.");
  return text;
}

async function legacyGemini(messages: ChatMessage[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
  if (!apiKey) throw new Error("No DOG Engine endpoint is configured.");
  const contents = messages.filter((m) => m.role !== "system").map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`DOG Engine ${r.status}: ${d?.error?.message || "Request failed"}`);
  const text = d?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
  if (!text.trim()) throw new Error("DOG Engine returned an empty response.");
  return text;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const messages = normalize((req.body || {}) as RequestBody);
    if (!messages.length) return res.status(400).json({ ok: false, error: "A message is required." });

    let text: string;
    try {
      text = await openAICompatible(messages);
    } catch (primaryError) {
      // Temporary compatibility path while the open-model endpoint is being connected.
      // The frontend still talks only to DOG Engine and never sees provider details.
      if (process.env.DOG_ENGINE_BASE_URL) throw primaryError;
      text = await legacyGemini(messages);
    }

    return res.status(200).json({ ok: true, text });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: error instanceof Error ? error.message : "DOG could not get a response.",
    });
  }
}
