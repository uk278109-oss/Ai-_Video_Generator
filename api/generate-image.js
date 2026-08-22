import { InferenceClient } from "@huggingface/inference";

export const config = {
  maxDuration: 60
};

export default async function handler(req, res) {

  if (req.method !== "POST") {

    res.setHeader(
      "Allow",
      "POST"
    );

    return res.status(405).json({
      error:
        "Method not allowed."
    });
  }


  try {

    const {
      prompt,
      ratio
    } = req.body || {};


    if (
      typeof prompt !== "string" ||
      !prompt.trim()
    ) {
      return res.status(400).json({
        error:
          "Please enter an image prompt."
      });
    }


    if (!process.env.HF_TOKEN) {

      return res.status(500).json({

        error:
          "HF_TOKEN is not configured on the server."

      });
    }


    const client =
      new InferenceClient(
        process.env.HF_TOKEN
      );


    /*
     * Use the selected ratio to build a size request.
     * We keep the model/provider call simple for compatibility.
     */

    const ratioMap = {

      "1:1": {
        width: 1024,
        height: 1024
      },

      "16:9": {
        width: 1024,
        height: 576
      },

      "9:16": {
        width: 576,
        height: 1024
      }

    };


    const size =
      ratioMap[ratio] ||
      ratioMap["1:1"];


    console.log({
      type: "image",
      ratio,
      width: size.width,
      height: size.height
    });


    const image =
      await client.textToImage({

        inputs:
          prompt.trim(),

        model:
          "black-forest-labs/FLUX.1-schnell"

      });


    if (
      !image ||
      typeof image.arrayBuffer !== "function"
    ) {
      throw new Error(
        "The AI provider returned an invalid image response."
      );
    }


    const buffer =
      Buffer.from(
        await image.arrayBuffer()
      );


    res.setHeader(

      "Content-Type",

      image.type &&
      image.type.startsWith("image/")
        ? image.type
        : "image/png"

    );


    res.setHeader(
      "Content-Length",
      buffer.length
    );


    res.setHeader(
      "Cache-Control",
      "no-store"
    );


    return res
      .status(200)
      .send(buffer);

  } catch (error) {

    console.error(
      "Image generation error:",
      error
    );


    return res.status(500).json({

      error:
        error?.message ||
        "Image generation failed. Please try again."

    });
  }
}
