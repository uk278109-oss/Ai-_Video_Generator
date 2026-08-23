export const config = {
  maxDuration: 60
};

const BRAVE_API =
  "https://api.search.brave.com/res/v1/chat/completions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      error: "Method not allowed."
    });
  }

  try {
    const { message, messages = [] } = req.body || {};

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Please enter a question."
      });
    }

    if (!process.env.BRAVE_SEARCH_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "BRAVE_SEARCH_API_KEY is not configured."
      });
    }

    const history = Array.isArray(messages)
      ? messages.slice(-10).map((item) => ({
          role:
            item.role === "assistant"
              ? "assistant"
              : "user",
          content: String(item.content || "").slice(0, 4000)
        }))
      : [];

    const response = await fetch(BRAVE_API, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Subscription-Token":
          process.env.BRAVE_SEARCH_API_KEY
      },

      body: JSON.stringify({
        model: "brave",
        stream: false,

        messages: [
          {
            role: "system",
            content:
              "You are First AI Research Assistant. " +
              "Answer like a helpful ChatGPT-style research assistant. " +
              "Use current web information when relevant. " +
              "Be clear, accurate, and concise. " +
              "Explain uncertainty instead of inventing facts. " +
              "Use headings and bullet points when helpful."
          },
          ...history,
          {
            role: "user",
            content: message.trim()
          }
        ]
      })
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        "Research service returned an invalid response."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
        data?.message ||
        "Research request failed."
      );
    }

    const answer =
      data?.choices?.[0]?.message?.content ||
      data?.answer ||
      "";

    if (!answer) {
      throw new Error(
        "No research answer was returned."
      );
    }

    return res.status(200).json({
      success: true,
      answer
    });

  } catch (error) {
    console.error(
      "Research assistant error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Research assistant failed."
    });
  }
  }
