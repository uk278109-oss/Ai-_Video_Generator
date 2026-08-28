const API_URL = "https://api.aimlapi.com/v2/video/generations";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
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

  try {
    const {
      image,
      image_url,
      prompt,
      duration = 5
    } = req.body || {};

    const finalImage =
      image_url || image;

    if (!finalImage) {
      return res.status(400).json({
        success: false,
        error: "Image is required."
      });
    }

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        success: false,
        error: "Motion prompt is required."
      });
    }

    let finalDuration =
      Number(duration);

    if (![5, 10, 15].includes(finalDuration)) {
      finalDuration = 5;
    }

    const payload = {
      model: "alibaba/wan-2-6-i2v",
      prompt: String(prompt).trim(),
      image_url: finalImage,
      duration: finalDuration,
      resolution: "720p"
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
      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          data?.message ||
          "Could not start image-to-video generation.",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      taskId: data.id,
      project: data.id,
      status: data.status || "queued",
      video: data?.video?.url || null
    });

  } catch (error) {
    console.error(
      "AIMLAPI image-to-video error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Image-to-video generation failed."
    });
  }
        }
