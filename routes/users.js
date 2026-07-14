import express from "express";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

router.get("/", verifyToken, requireRole("Admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete(
  "/:id",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User removed successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id/role",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      const { role } = req.body;
      if (!["Supporter", "Creator", "Admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select("-password");
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch("/credits", verifyToken, async (req, res) => {
  try {
    const { credits } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { credits } },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get(
  "/admin/stats",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      const [supporters, creators, allUsers, payments] = await Promise.all([
        User.countDocuments({ role: "Supporter" }),
        User.countDocuments({ role: "Creator" }),
        User.find(),
        Payment.countDocuments({ status: "paid" }),
      ]);
      const totalCredits = allUsers.reduce((sum, u) => sum + (u.credits || 0), 0);
      res.json({
        supporters,
        creators,
        totalCredits,
        paymentsProcessed: payments,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
