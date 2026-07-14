import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createToken } from "../utils/jwt.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, photoURL } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const credits = role === "Creator" ? 20 : role === "Supporter" ? 50 : 0;
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      photoURL: photoURL || "",
      credits,
    });
    const token = createToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = createToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/google-login", async (req, res) => {
  try {
    const { name, email, photoURL } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email,
        photoURL: photoURL || "",
        role: "Supporter",
        credits: 50,
      });
    }
    const token = createToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,
      photoURL: user.photoURL,
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
