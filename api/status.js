export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      success: false,
      error: "Method not allowed."
    });
  }

  const {
    id,
    type = "video"
  } = req.query || {};

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Missing generation ID."
    });
  }

  /*
   * Unified First AI status endpoint.
   *
   * Later, generate-video.js and generate-image-video.js
   * can save job information using this ID.
   */

  return res.status(200).json({
    success: true,
    id,
    type,
    status: "processing",
    progress: 0,
    message: "Generation status tracking is ready."
  });
}
