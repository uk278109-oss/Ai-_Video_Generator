export default async function handler(req, res) {
  // Only POST requests allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const {
      image,
      prompt,
      negative_prompt = "",
      duration = 3.5
    } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "Please provide an image"
      });
    }

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Please provide a prompt"
      });
    }

    // Hugging Face Wan 2.2 Video API
    const response = await fetch(
      "https://kulkas2pintu-wan555.hf.space/run/generate_video",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          data: [
            {
              path: image,
              url: image,
              orig_name: "input.png",
              mime_type: "image/png",
              is_stream: false
            },

            prompt,

            negative_prompt,

            duration,

            8,

            5,

            "FlowMatchEulerDiscrete",

            -1,

            0
          ]
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(result);

      return res.status(response.status).json({
        success: false,
        error: result?.detail || result?.error || "Video API failed"
      });
    }

    // Gradio response
    const video =
      result?.data?.[0]?.url ||
      result?.data?.[0]?.path ||
      result?.data?.[0];

    return res.status(200).json({
      success: true,
      video,
      raw: result
    });

  } catch (error) {

    console.error("VIDEO ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Video generation failed"
    });

  }
}
