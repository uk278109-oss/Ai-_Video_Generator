import { InferenceClient } from "@huggingface/inference";

export const maxDuration = 60;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Please enter a video prompt."
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        error: "Prompt is too long."
      });
    }

    const token = process.env.HF_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "HF_TOKEN is not configured on the server."
      });
    }

    const hf = new InferenceClient(token);

    const video = await hf.textToVideo({
      provider: "fal-ai",
      model: "Wan-AI/Wan2.2-TI2V-5B",
      inputs: prompt
    });

    const arrayBuffer = await video.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return res.status(200).json({
      success: true,
      video: `data:video/mp4;base64,${base64}`
    });

  } catch (error) {
    console.error("Video generation error:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Video generation failed. Please try again."
    });
  }
  }
