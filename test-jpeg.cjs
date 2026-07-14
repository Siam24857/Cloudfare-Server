const cloudinary = require("cloudinary").v2;
require("dotenv").config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// A real 1x1 JPEG (what a phone photo would be)
const jpegB64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAAv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AfwD/2Q==";
cloudinary.uploader.upload(`data:image/png;base64,${jpegB64}`, { folder: "clodfare" })
  .then((r) => console.log("JPEG-WITH-PNG-PREFIX SUCCESS:", r.secure_url, "format=", r.format))
  .catch((e) => console.log("JPEG-WITH-PNG-PREFIX FAIL:", e.http_code, e.message));
