import type { NextApiRequest, NextApiResponse } from "next";
import { cloudinary } from "~/lib/cloudinary";
import { env } from "~/env.mjs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  try {
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: "avatars" },
      env.CLOUDINARY_API_SECRET,
    );

    return res.status(200).json({
      timestamp,
      signature,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      folder: "avatars",
    });
  } catch (error) {
    console.error("Failed to sign Cloudinary request", error);
    return res.status(500).json({ message: "Failed to sign request" });
  }
}
