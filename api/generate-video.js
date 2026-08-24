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

    if (
      typeof prompt !== "string" ||
      !prompt.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Please enter a video prompt."
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Prompt is too long."
      });
    }

    /*
      VIDEO PROVIDER

      GPU_WORKER_URL ko Vercel Environment Variables
      mein set kiya jayega.

      Example:
      https://your-video-worker.example.com
    */

    const workerUrl =
      process.env.GPU_WORKER_URL;

    if (!workerUrl) {
      return res.status(503).json({
        success: false,
        error:
          "Video GPU is not connected yet."
      });
    }

    const response = await fetch(
      `${workerUrl}/generate`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          prompt: prompt.trim()
        })
      }
    );

    const raw =
      await response.text();

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(
        "Video worker returned an invalid response."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.detail ||
        "Video generation failed."
      );
    }

    /*
      Worker should return:

      {
        "success": true,
        "video_url": "https://..."
      }

      OR:

      {
        "video": "/video/..."
      }
    */

    const videoUrl =
      data.video_url ||
      data.url ||
      data.video;

    if (!videoUrl) {
      throw new Error(
        "Video URL was not returned."
      );
    }

    return res.status(200).json({
      success: true,
      video_url: videoUrl
    });

  } catch (error) {

    console.error(
      "Video generation error:",
      error
    );

    return res.status(500).json({
      success: false,

      error:
        error?.message ||
        "Video generation failed."
    });
  }
      }
