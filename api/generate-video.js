export const config = {
  maxDuration: 60
};

const GPU_WORKER =
  "https://point-posts-assigned-stronger.trycloudflare.com";

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

    const response = await fetch(
      `${GPU_WORKER}/generate`,
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

    const data =
      await response.json();

    if (!response.ok) {

      return res.status(
        response.status
      ).json({
        success: false,
        error:
          data?.detail ||
          data?.error ||
          "Video generation failed."
      });
    }

    if (
      !data?.success ||
      !data?.video_file
    ) {
      return res.status(500).json({
        success: false,
        error:
          "Invalid response from GPU worker."
      });
    }

    return res.status(200).json({
      success: true,

      video_url:
        `${GPU_WORKER}/video/${encodeURIComponent(
          data.video_file
        )}`,

      filename:
        data.video_file
    });

  } catch (error) {

    console.error(
      "GPU Worker Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Could not connect to GPU worker."
    });
  }
}
