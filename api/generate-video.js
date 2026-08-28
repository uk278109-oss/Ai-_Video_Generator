const API_URL = "https://api.aimlapi.com/v2/video/generations";

function send(res, status, data) {
  res.status(status).json(data);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const apiKey = process.env.AIMLAPI_KEY;

  if (!apiKey) {
    return send(res, 500, {
      success: false,
      error: "AIMLAPI_KEY is not configured."
    });
  }

  try {
    /* CHECK VIDEO STATUS */
    if (req.method === "GET") {
      const generationId =
        req.query?.generation_id ||
        req.query?.project ||
        req.query?.taskId;

      if (!generationId) {
        return send(res, 400, {
          success: false,
          error: "generation_id is required."
        });
      }

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
        return send(res, response.status, {
          success: false,
          error:
            data?.error?.message ||
            data?.message ||
            "Could not check video status."
        });
      }

      return send(res, 200, {
        success: true,
        id: data.id,
        status: data.status,
        url: data?.video?.url || null,
        error:
          data?.error?.message ||
          null
      });
    }

    /* CREATE TEXT TO VIDEO */
    if (req.method !== "POST") {
      return send(res, 405, {
        success: false,
        error: "Method not allowed."
      });
    }

    const {
      prompt,
      duration = 5
    } = req.body || {};

    if (!prompt || !String(prompt).trim()) {
      return send(res, 400, {
        success: false,
        error: "Prompt is required."
      });
    }

    /*
      AIMLAPI Text → Video model.
      Change this model later from the frontend/backend
      if you want another supported provider/model.
    */
    const payload = {
      model: "video-01",
      prompt: String(prompt).trim(),
      enhance_prompt: true
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return send(res, response.status, {
        success: false,
        error:
          data?.error?.message ||
          data?.message ||
          "Could not start video generation.",
        details: data
      });
    }

    return send(res, 200, {
      success: true,
      project: data.id,
      taskId: data.id,
      status: data.status || "queued",
      url: data?.video?.url || null
    });

  } catch (error) {
    console.error("AIMLAPI video error:", error);

    return send(res, 500, {
      success: false,
      error:
        error.message ||
        "Video generation failed."
    });
  }
          }
