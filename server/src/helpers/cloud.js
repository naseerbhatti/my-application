import config from "../config/index.js";

const cloudinary = config.cloudinary;

export const getSignedUrl = (req, res) => {
  try {
    console.log("enter the signURL");

    const folder = req.query.folder || "uploads";
    const count = parseInt(req.query.count || "1", 10);
    if (isNaN(count) || count < 1 || count > 10) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid count (1-10 allowed)" });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const uploads = [];

    for (let i = 0; i < count; i++) {
      const uniqueId = `${timestamp}_${i}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;
      const publicId = `${folder}/${uniqueId}`;

      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder,
          public_id: publicId,
        },
        process.env.CLOUDINARY_API_SECRET,
      );

      uploads.push({
        uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload`,
        timestamp,
        signature,
        // add cryptographic api key
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
        publicId,
        type: "upload",
      });
    }

    return res.json({
      success: true,
      count: uploads.length,
      uploads,
    });
  } catch (error) {
    console.error("Cloudinary multi-sign error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
