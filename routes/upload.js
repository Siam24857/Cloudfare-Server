import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

const handleUpload = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: "imageBase64 is required" });
    }
    const url = await uploadToCloudinary(imageBase64);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.post("/public", handleUpload);

router.post("/", verifyToken, handleUpload);

export default router;
