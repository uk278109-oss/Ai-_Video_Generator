export const config = {
  maxDuration: 60
};

const API = "https://api.magichour.ai";

function getError(data, fallback) {
  return (
    data?.error?.message ||
    data?.message ||
    data?.error ||
    fallback
  );
}

export default async function handler(req, res) {

  const apiKey = process.env.Mgh_API;

  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "Mgh_API is not configured."
    });
  }

  // =========================
  // CHECK VIDEO STATUS
  // =========================

  if (req.method === "GET") {

    try {

      const id = String(
        req.query?.id || ""
      ).trim();

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Missing project id."
        });
      }

      const response = await fetch(
        `${API}/v1/video-projects/${encodeURIComponent(id)}`,
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Accept": "application/json"
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: getError(
            data,
            "Could not check video status."
          )
        });
      }

      return res.status(200).json({
        success: true,
        id: data.id,
        status: data.status,
        url:
          data?.downloads?.[0]?.url ||
          null,
        error:
          data?.error ||
          null
      });

    } catch (error) {

      console.error(
        "Image-to-video status error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error?.message ||
          "Could not check video status."
      });
    }
  }

  // =========================
  // ONLY POST ALLOWED
  // =========================

  if (req.method !== "POST") {

    res.setHeader(
      "Allow",
      "POST, GET"
    );

    return res.status(405).json({
      success: false,
      error: "Method not allowed."
    });
  }

  try {

    const {
      image,
      mimeType,
      prompt = "",
      duration = 5
    } = req.body || {};

    // =========================
    // VALIDATE IMAGE
    // =========================

    if (
      typeof image !== "string" ||
      !image.startsWith("data:image/")
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Please upload a valid image."
      });
    }

    const match = image.match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
    );

    if (!match) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid image data."
      });
    }

    const contentType =
      mimeType || match[1];

    const extensionMap = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/webp": "webp"
    };

    const extension =
      extensionMap[contentType] ||
      "png";

    const imageBuffer = Buffer.from(
      match[2],
      "base64"
    );

    // Maximum 4 MB

    if (
      imageBuffer.length >
      4 * 1024 * 1024
    ) {
      return res.status(413).json({
        success: false,
        error:
          "Image is too large. Please use an image under 4 MB."
      });
    }

    // =========================
    // STEP 1
    // GET MAGIC HOUR UPLOAD URL
    // =========================

    const uploadResponse = await fetch(
      `${API}/v1/files/upload-urls`,
      {
        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${apiKey}`,

          "Accept":
            "application/json",

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          items: [
            {
              type: "image",
              extension: extension
            }
          ]
        })
      }
    );

    const uploadData =
      await uploadResponse.json();

    if (!uploadResponse.ok) {

      return res.status(
        uploadResponse.status
      ).json({
        success: false,

        error: getError(
          uploadData,
          "Could not prepare image upload."
        )
      });
    }

    const uploadItem =
      uploadData?.items?.[0];

    if (
      !uploadItem?.upload_url ||
      !uploadItem?.file_path
    ) {

      return res.status(500).json({
        success: false,

        error:
          "Magic Hour did not return an upload location."
      });
    }

    // =========================
    // STEP 2
    // UPLOAD IMAGE
    // =========================

    const putResponse =
      await fetch(
        uploadItem.upload_url,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              contentType
          },

          body:
            imageBuffer
        }
      );

    if (!putResponse.ok) {

      return res.status(502).json({
        success: false,

        error:
          "Image upload to Magic Hour failed."
      });
    }

    // =========================
    // STEP 3
    // CREATE IMAGE TO VIDEO JOB
    // =========================

    const createResponse =
      await fetch(
        `${API}/v1/image-to-video`,
        {
          method: "POST",

          headers: {
            "Authorization":
              `Bearer ${apiKey}`,

            "Accept":
              "application/json",

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            name:
              `First AI Image Video ${Date.now()}`,

            end_seconds:
              Number(duration) || 5,

            model:
              "default",

            resolution:
              "480p",

            audio:
              false,

            style: {

              prompt:
                String(prompt).trim() ||
                "Natural realistic motion, smooth cinematic movement"

            },

            assets: {

              image_file_path:
                uploadItem.file_path

            }

          })
        }
      );

    const createData =
      await createResponse.json();

    if (
      !createResponse.ok ||
      !createData?.id
    ) {

      return res.status(
        createResponse.status || 500
      ).json({

        success: false,

        error: getError(
          createData,
          "Could not create Image to Video job."
        )

      });
    }

    // =========================
    // SUCCESS
    // =========================

    return res.status(200).json({

      success: true,

      id:
        createData.id,

      status:
        "queued",

      credits_charged:
        createData.credits_charged ??
        null

    });

  } catch (error) {

    console.error(
      "Image-to-video error:",
      error
    );

    return res.status(500).json({

      success: false,

      error:
        error?.message ||
        "Image to Video generation failed."

    });
  }
      }
