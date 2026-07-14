import { v2 as cloudinary } from "cloudinary";

export const uploadToCloudinary = async (image) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary is not configured on the server");
  }
  // Accept either a raw base64 string or a full data URL from the client
  const dataUri = image.startsWith("data:") ? image : `data:image/png;base64,${image}`;
  const res = await cloudinary.uploader.upload(dataUri, {
    folder: "clodfare",
    overwrite: true,
  });
  return res.secure_url;
};
