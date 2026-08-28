const API_URL = "https://api.aimlapi.com/v2/video/generations";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed."
    });
  }

  const apiKey = process.env.AIMLAPI_KEY;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "AIMLAPI_KEY is not configured."
    });
  }

  const generationId =
    req.query?.generation_id ||
    req.query?.project ||
    req.query?.taskId;

  if (!generationId) {
    return res.status(400).json({
      success: false,
      error: "generation_id is required."
    });
  }

  try {
    const response = await fetch(
      `${API_URL}?generation_id=${encodeURIComponent(generationId)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          data?.message ||
          "Could not check generation status."
      });
    }

    return res.status(200).json({
      success: true,
      id: data.id,
      status: data.status,
      url: data?.video?.url || null,
      error:
        data?.error?.message ||
        null
    });

  } catch (error) {
    console.error("AIMLAPI status error:", error);

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Status check failed."
    });
  }
}
