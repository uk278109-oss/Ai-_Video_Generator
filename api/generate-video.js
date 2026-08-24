import { InferenceClient } from "@huggingface/inference";

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
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        success: false,
        error: "Please enter a video prompt."
      });
    }

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({
        success: false,
        error: "HF_TOKEN is not configured."
      });
    }

    const client = new InferenceClient(
      process.env.HF_TOKEN
    );

    const video = await client.textToVideo({
      model: "Wan-AI/Wan2.2-TI2V-5B",
      inputs: prompt.trim()
    });

    const buffer = Buffer.from(
      await video.arrayBuffer()
    );

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Length",
      buffer.length
    );

    return res.status(200).send(buffer);

  } catch (error) {
    console.error("Video error:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Video generation failed."
    });
  }
      }
