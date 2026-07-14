import express from "express";
import Contribution from "../models/Contribution.js";
import Campaign from "../models/Campaign.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "../utils/email.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

const todayStr = () => new Date().toISOString().split("T")[0];

router.post(
  "/",
  verifyToken,
  requireRole("Supporter"),
  async (req, res) => {
    try {
      const { campaign_id, contribution_amount, message } = req.body;
      const campaign = await Campaign.findById(campaign_id);
      if (!campaign)
        return res.status(404).json({ message: "Campaign not found" });
      if (campaign.status !== "approved")
        return res
          .status(400)
          .json({ message: "Campaign is not open for contributions" });
      if (new Date(campaign.deadline) < new Date().setHours(0, 0, 0, 0))
        return res
          .status(400)
          .json({ message: "Campaign deadline has passed" });
      if (contribution_amount < campaign.minimum_contribution)
        return res.status(400).json({
          message: `Minimum contribution is ${campaign.minimum_contribution} credits`,
        });

      const supporter = await User.findById(req.user.id);
      if (supporter.credits < contribution_amount)
        return res
          .status(400)
          .json({ message: "Insufficient credits" });

      supporter.credits -= contribution_amount;
      await supporter.save();

      const contribution = await Contribution.create({
        campaign_id,
        campaign_title: campaign.campaign_title,
        contribution_amount,
        supporter_email: supporter.email,
        supporter_name: supporter.name,
        creator_name: campaign.creator_name,
        creator_email: campaign.creator_email,
        message: message || "",
        date: todayStr(),
        status: "pending",
      });

      await Notification.create({
        message: `${supporter.name} contributed ${contribution_amount} credits to your campaign "${campaign.campaign_title}".`,
        toEmail: campaign.creator_email,
        actionRoute: "/dashboard/contributions-review",
      });

      res.status(201).json(contribution);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/creator/pending",
  verifyToken,
  requireRole("Creator"),
  async (req, res) => {
    try {
      const contributions = await Contribution.find({
        creator_email: req.user.email,
        status: "pending",
      });
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id/approve",
  verifyToken,
  requireRole("Creator"),
  async (req, res) => {
    try {
      const contribution = await Contribution.findById(req.params.id);
      if (!contribution)
        return res.status(404).json({ message: "Contribution not found" });
      if (contribution.creator_email !== req.user.email)
        return res.status(403).json({ message: "Forbidden" });

      contribution.status = "approved";
      await contribution.save();

      await Campaign.findByIdAndUpdate(contribution.campaign_id, {
        $inc: { amount_raised: contribution.contribution_amount },
      });
      await User.findOneAndUpdate(
        { email: contribution.creator_email },
        { $inc: { raised_credits: contribution.contribution_amount } }
      );

      await Notification.create({
        message: `Your contribution of ${contribution.contribution_amount} credits to "${contribution.campaign_title}" was approved by ${req.user.name}.`,
        toEmail: contribution.supporter_email,
        actionRoute: "/dashboard/supporter-home",
      });
      await sendEmail({
        to: contribution.supporter_email,
        subject: "Your contribution was approved",
        html: `<h3>Good news!</h3><p>Your contribution of <b>${contribution.contribution_amount} credits</b> to <b>${contribution.campaign_title}</b> was approved by ${req.user.name}.</p>`,
      });

      res.json(contribution);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id/reject",
  verifyToken,
  requireRole("Creator"),
  async (req, res) => {
    try {
      const contribution = await Contribution.findById(req.params.id);
      if (!contribution)
        return res.status(404).json({ message: "Contribution not found" });
      if (contribution.creator_email !== req.user.email)
        return res.status(403).json({ message: "Forbidden" });

      contribution.status = "rejected";
      await contribution.save();

      await User.findOneAndUpdate(
        { email: contribution.supporter_email },
        { $inc: { credits: contribution.contribution_amount } }
      );

      await Notification.create({
        message: `Your contribution of ${contribution.contribution_amount} credits to "${contribution.campaign_title}" was rejected by ${req.user.name} and refunded.`,
        toEmail: contribution.supporter_email,
        actionRoute: "/dashboard/supporter-home",
      });
      await sendEmail({
        to: contribution.supporter_email,
        subject: "Your contribution was refunded",
        html: `<h3>Contribution update</h3><p>Your contribution of <b>${contribution.contribution_amount} credits</b> to <b>${contribution.campaign_title}</b> was rejected by ${req.user.name} and your credits have been refunded.</p>`,
      });

      res.json(contribution);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/supporter/approved",
  verifyToken,
  requireRole("Supporter"),
  async (req, res) => {
    try {
      const contributions = await Contribution.find({
        supporter_email: req.user.email,
        status: "approved",
      });
      res.json(contributions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/supporter/all",
  verifyToken,
  requireRole("Supporter"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      const total = await Contribution.countDocuments({
        supporter_email: req.user.email,
      });
      const contributions = await Contribution.find({
        supporter_email: req.user.email,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      res.json({ contributions, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/supporter/stats",
  verifyToken,
  requireRole("Supporter"),
  async (req, res) => {
    try {
      const all = await Contribution.find({ supporter_email: req.user.email });
      const totalContributions = all.length;
      const pending = all.filter((c) => c.status === "pending").length;
      const totalAmount = all
        .filter((c) => c.status === "approved")
        .reduce((sum, c) => sum + c.contribution_amount, 0);
      res.json({ totalContributions, pending, totalAmount });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
