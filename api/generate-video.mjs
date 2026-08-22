import { InferenceClient } from "@huggingface/inference";

export const config = {
  maxDuration: 60
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed."
    });
  }

  try {
    const { prompt } = req.body || {};

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter a video prompt."
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        error: "Prompt is too long."
      });
    }

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({
        error: "HF_TOKEN is not configured on the server."
      });
    }

    const client = new InferenceClient(process.env.HF_TOKEN);

    const video = await client.textToVideo({
      provider: "fal-ai",
      model: "Wan-AI/Wan2.2-TI2V-5B",
      inputs: prompt.trim()
    });

    const buffer = Buffer.from(
      await video.arrayBuffer()
    );

    res.setHeader(
      "Content-Type",
      "video/mp4"
    );

    res.setHeader(
      "Content-Length",
      buffer.length
    );

    return res.status(200).send(buffer);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error:
        error?.message ||
        "Video generation failed."
    });
  }
  }
