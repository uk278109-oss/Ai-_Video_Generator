export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, type = "general", amount = 10 } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a topic or idea."
      });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return res.status(500).json({
        success: false,
        error: "Groq API key is not configured."
      });
    }

    const ideaAmount = Math.min(Number(amount) || 10, 10);

    const systemPrompt = `
You are First AI's creative Text Ideas assistant.

Generate exactly ${ideaAmount} useful, creative and high-quality ideas.

Category selected by the user: ${type}

Rules:
- Write in clear English.
- Number every idea.
- Give each idea a short title.
- Add a brief practical description.
- Include a suggested AI prompt when useful.
- Do not mention that you are an AI.
- Do not add unnecessary introductions.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`
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
        error: data?.error?.message || "Failed to generate ideas."
      });
    }

    const ideas = data?.choices?.[0]?.message?.content;

    if (!ideas) {
      return res.status(500).json({
        success: false,
        error: "No ideas were generated."
      });
    }

    return res.status(200).json({
      success: true,
      ideas
    });

  } catch (error) {
    console.error("Generate Ideas Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Something went wrong."
    });
  }
          }
