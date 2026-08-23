export const config = {
  maxDuration: 60
};

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

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OPENAI_API_KEY is not configured."
      });
    }

    const history = Array.isArray(messages)
      ? messages.slice(-12).map(item => ({
          role:
            item.role === "assistant"
              ? "assistant"
              : "user",

          content:
            String(item.content || "")
              .slice(0, 4000)
        }))
      : [];

    const input = [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You are First AI Research Assistant. " +
              "Work like a helpful ChatGPT-style assistant. " +
              "For questions requiring current or factual web information, " +
              "use web search. Give clear, useful answers. " +
              "Do not invent facts. If information is uncertain, say so. " +
              "Use headings and bullet points when helpful."
          }
        ]
      },

      ...history.map(item => ({
        role: item.role,
        content: [
          {
            type: "input_text",
            text: item.content
          }
        ]
      })),

      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: message.trim()
          }
        ]
      }
    ];

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-5.6-luna",

          tools: [
            {
              type: "web_search"
            }
          ],

          input
        })
      }
    );

    const raw = await response.text();

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(
        "OpenAI returned an invalid response."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
        "OpenAI research request failed."
      );
    }

    const answer =
      data?.output_text;

    if (!answer) {
      throw new Error(
        "No answer was returned."
      );
    }

    return res.status(200).json({
      success: true,
      answer
    });

  } catch (error) {

    console.error(
      "Research error:",
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
