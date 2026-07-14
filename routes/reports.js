import express from "express";
import Report from "../models/Report.js";
import Campaign from "../models/Campaign.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

const todayStr = () => new Date().toISOString().split("T")[0];

router.post("/", verifyToken, async (req, res) => {
  try {
    const { campaign_id, reason } = req.body;
    if (!campaign_id || !reason) {
      return res
        .status(400)
        .json({ message: "Campaign and reason are required" });
    }
    const campaign = await Campaign.findById(campaign_id);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    const report = await Report.create({
      campaign_id,
      campaign_title: campaign.campaign_title,
      reporter_email: req.user.email,
      reporter_name: req.user.name,
      reason,
      date: todayStr(),
      status: "open",
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get(
  "/admin",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      const reports = await Report.find().sort({ createdAt: -1 });
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id/resolve",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      const report = await Report.findByIdAndUpdate(
        req.params.id,
        { status: "resolved" },
        { new: true }
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
