export default async function handler(req, res) {
  const API_KEY = process.env.JSON2VIDEO_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      success: false,
      error: "JSON2VIDEO_API_KEY is not configured."
    });
  }

  const headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
  };

  try {
    // CREATE VIDEO JOB
    if (req.method === "POST") {
      const { prompt, duration = 5 } = req.body || {};

      if (!prompt || !prompt.trim()) {
        return res.status(400).json({
          success: false,
          error: "Please enter a video prompt."
        });
      }

      const seconds = Math.max(
        3,
        Math.min(Number(duration) || 5, 20)
      );

      const movie = {
        resolution: "hd",
        quality: "medium",
        scenes: [
          {
            duration: seconds,
            elements: [
              {
                type: "text",
                text: prompt.trim(),
                duration: seconds,
                style: "001"
              }
            ]
          }
        ]
      };

      const response = await fetch(
        "https://api.json2video.com/v2/movies",
        {
          method: "POST",
          headers,
          body: JSON.stringify(movie)
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return res.status(response.status || 500).json({
          success: false,
          error:
            data.message ||
            data.error ||
            "Could not start video generation."
        });
      }

      return res.status(200).json({
        success: true,
        project: data.project,
        status: "queued"
      });
    }

    // CHECK VIDEO STATUS
    if (req.method === "GET") {
      const project = req.query.project;

      if (!project) {
        return res.status(400).json({
          success: false,
          error: "Missing project ID."
        });
      }

      const response = await fetch(
        "https://api.json2video.com/v2/movies?project=" +
          encodeURIComponent(project),
        {
          headers: {
            "x-api-key": API_KEY
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error:
            data.message ||
            data.error ||
            "Could not check video status."
        });
      }

      const movie = data.movie || {};

      return res.status(200).json({
        success: true,
        status: movie.status,
        url: movie.url || null,
        error: movie.message || null
      });
    }

    res.setHeader("Allow", "POST, GET");

    return res.status(405).json({
      success: false,
      error: "Method not allowed."
    });

  } catch (error) {
    console.error("JSON2Video error:", error);

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Video generation failed."
    });
  }
            }
