export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, type = "general" } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a topic or idea."
      });
    }

    // Check Groq API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Groq API key is not configured."
      });
    }

    const systemPrompt = `
You are First AI's creative Text Ideas assistant.

Generate useful, creative and high-quality ideas based on the user's topic.

The user selected this category: ${type}

Your response must:
- Be written in clear English.
- Give 10 creative ideas.
- Number every idea from 1 to 10.
- Make each idea practical and interesting.
- For each idea include:
  1. A short title
  2. A brief description
  3. A suggested AI prompt when useful

Do not mention that you are an AI.
Do not add unnecessary introductions.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt.trim()
            }
          ],
          temperature: 0.9,
          max_completion_tokens: 1800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API Error:", data);

      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          "Failed to generate ideas."
      });
    }

    const ideas =
      data?.choices?.[0]?.message?.content;

    if (!ideas) {
      return res.status(500).json({
        success: false,
        error: "No ideas were generated."
      });
    }

    return res.status(200).json({
      success: true,
      ideas: ideas
    });

  } catch (error) {
    console.error("Generate Ideas Error:", error);

    return res.status(500).json({
      success: false,
      error: "Something went wrong while generating ideas."
    });
  }
}
