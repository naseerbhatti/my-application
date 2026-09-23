import cloudinary from "cloudinary";
const config = {
  port: process.env.PORT || 5000,
  dbUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET,
  SBCA_api_token: process.env.SBCA_api_token,
  SBCA_api_base_url:
    process.env.SBCA_api_base_url || "https://beta.sbca.gos.pk/",
  SBCA_api_username: process.env.SBCA_api_username || "saylani_api",
  SBCA_api_password: process.env.SBCA_api_password || "S@ylan!&786",
};

cloudinary.config({
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default { cloudinary, config };
