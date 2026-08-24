import { Client, handle_file } from "@gradio/client";

export const config = {
  maxDuration: 60
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const { image, prompt, duration = 3.5 } = req.body || {};

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "Please upload an image first."
      });
    }

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a motion prompt."
      });
    }

    const client = await Client.connect(
      "kulkas2pintu/wan555"
    );

    const result = await client.predict(
      "/generate_video",
      [
        handle_file(image), // input image
        null,               // last image
        prompt.trim(),      // prompt
        4,                  // inference steps
        "",                 // negative prompt
        Number(duration),   // duration
        1,                  // guidance scale
        1,                  // guidance scale 2
        42,                 // seed
        true,               // randomize seed
        5,                  // quality
        "UniPCMultistep",   // scheduler
        3,                  // flow shift
        16,                 // frame multiplier
        true,               // safe mode
        true,               // display result
        false               // final extra option
      ]
    );

    const video =
      result?.data?.[0]?.url ||
      result?.data?.[0]?.path ||
      result?.data?.[1]?.url ||
      result?.data?.[1]?.path;

    if (!video) {
      console.error("Unexpected HF response:", result);

      throw new Error(
        "Hugging Face did not return a video."
      );
    }

    return res.status(200).json({
      success: true,
      video
    });

  } catch (error) {
    console.error("Hugging Face video error:", error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Video generation failed."
    });
  }
}
