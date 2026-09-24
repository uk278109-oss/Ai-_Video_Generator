import type { VercelRequest, VercelResponse } from "@vercel/node";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type RequestBody = {
  messages?: ChatMessage[];
  message?: string;
  provider?: "auto" | "gemini" | "grok";
  model?: string;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";

const XAI_MODEL =
  process.env.XAI_TEXT_MODEL || "grok-4-1-fast-reasoning";

const SYSTEM_PROMPT = `
You are DOG AI, a helpful AI assistant.

For coding requests:
- Provide accurate, working code.
- Use clear code blocks with the correct language.
- Explain important parts briefly.
- Fix bugs when the user provides code.
- Never claim that a feature works if it has not actually been implemented.

For normal questions:
- Answer naturally and clearly.
- Do not mention internal APIs, providers, routing, or environment variables.
`;

function normalizeMessages(body: RequestBody): ChatMessage[] {
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    return body.messages
      .filter(
        (m) =>
          m &&
          typeof m.content === "string" &&
          ["user", "assistant", "system"].includes(m.role)
      )
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));
  }

  if (typeof body.message === "string" && body.message.trim()) {
    return [
      {
        role: "user",
        content: body.message.trim(),
      },
    ];
  }

  return [];
}

function getErrorText(value: unknown): string {
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value);
  } catch {
    return "Unknown provider error";
  }
}

async function callGemini(messages: ChatMessage[]) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const systemMessages = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const conversation = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      GEMINI_MODEL
    )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(systemMessages || SYSTEM_PROMPT
          ? {
              systemInstruction: {
                parts: [
                  {
                    text: `${SYSTEM_PROMPT}\n\n${systemMessages}`,
                  },
                ],
              },
            }
          : {}),
        contents: conversation,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Gemini ${response.status}: ${
        data?.error?.message || getErrorText(data)
      }`
    );
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("") || "";

  if (!text.trim()) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

async function callGrok(messages: ChatMessage[]) {
  if (!XAI_API_KEY) {
    throw new Error("XAI_API_KEY is not configured");
  }

  const grokMessages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    ...messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role,
        content: m.content,
      })),
  ];

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${XAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: XAI_MODEL,
      messages: grokMessages,
      temperature: 0.4,
      max_tokens: 8192,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Grok ${response.status}: ${
        data?.error?.message ||
        data?.error?.code ||
        getErrorText(data)
      }`
    );
  }

  const text = data?.choices?.[0]?.message?.content;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Grok returned an empty response");
  }

  return text;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const body = (req.body || {}) as RequestBody;

    const messages = normalizeMessages(body);

    if (messages.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "A message is required",
      });
    }

    const provider = body.provider || "auto";

    const errors: string[] = [];

    if (provider === "gemini") {
      try {
        const text = await callGemini(messages);

        return res.status(200).json({
          ok: true,
          provider: "gemini",
          model: GEMINI_MODEL,
          text,
        });
      } catch (error) {
        return res.status(502).json({
          ok: false,
          provider: "gemini",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (provider === "grok") {
      try {
        const text = await callGrok(messages);

        return res.status(200).json({
          ok: true,
          provider: "grok",
          model: XAI_MODEL,
          text,
        });
      } catch (error) {
        return res.status(502).json({
          ok: false,
          provider: "grok",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // AUTO: Gemini first, then Grok fallback.
    try {
      const text = await callGemini(messages);

      return res.status(200).json({
        ok: true,
        provider: "gemini",
        model: GEMINI_MODEL,
        text,
      });
    } catch (error) {
      errors.push(
        `gemini: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    try {
      const text = await callGrok(messages);

      return res.status(200).json({
        ok: true,
        provider: "grok",
        model: XAI_MODEL,
        text,
      });
    } catch (error) {
      errors.push(
        `grok: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return res.status(502).json({
      ok: false,
      error: "DOG AI could not get a response.",
      details: errors,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unexpected server error",
    });
  }
        }
