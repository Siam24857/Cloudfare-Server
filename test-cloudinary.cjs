const cloudinary = require("cloudinary").v2;
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const tinyPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC";
cloudinary.uploader.upload(`data:image/png;base64,${tinyPng}`, { folder: "clodfare" })
  .then((r) => console.log("SUCCESS:", r.secure_url))
  .catch((e) => console.log("FAIL:", e.http_code, e.message));
