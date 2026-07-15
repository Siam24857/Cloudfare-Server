import express from "express";
import Campaign from "../models/Campaign.js";
import Contribution from "../models/Contribution.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/email.js";

const router = express.Router();

router.get("/approved", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const { category, search, sort } = req.query;

    const query = {
      status: "approved",
      suspended: false,
    };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { campaign_title: searchRegex },
        { creator_name: searchRegex },
        { campaign_story: searchRegex },
      ];
    }

    // Add deadline filter to query to exclude expired campaigns at DB level
    const today = new Date().toISOString().split('T')[0];
    query.deadline = { $gte: today };

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "most-funded") sortOption = { amount_raised: -1 };
    else if (sort === "least-funded") sortOption = { amount_raised: 1 };
    else if (sort === "ending-soon") sortOption = { deadline: 1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };

    const [total, campaigns] = await Promise.all([
      Campaign.countDocuments(query),
      Campaign.find(query).sort(sortOption).skip(skip).limit(limit),
    ]);

    res.json({ campaigns, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/top-funded", async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "approved" })
      .sort({ amount_raised: -1 })
      .limit(6);
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/",
  verifyToken,
  requireRole("Creator"),
  async (req, res) => {
    try {
      const {
        campaign_title,
        campaign_story,
        category,
        funding_goal,
        minimum_contribution,
        deadline,
        reward_info,
        imageBase64,
      } = req.body;
      let imageUrl = req.body.campaign_image_url || "";
      if (imageBase64) {
        imageUrl = await uploadToCloudinary(imageBase64);
      }
      const campaign = await Campaign.create({
        campaign_title,
        campaign_story,
        category,
        funding_goal,
        minimum_contribution,
        deadline,
        reward_info,
        campaign_image_url: imageUrl,
        creator_email: req.user.email,
        creator_name: req.user.name,
        status: "pending",
        amount_raised: 0,
      });
      res.status(201).json(campaign);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/creator/my-campaigns",
  verifyToken,
  requireRole("Creator"),
  async (req, res) => {
    try {
      const campaigns = await Campaign.find({
        creator_email: req.user.email,
      }).sort({ deadline: -1 });
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id",
  verifyToken,
  requireRole("Creator"),
  async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign)
        return res.status(404).json({ message: "Campaign not found" });
      if (campaign.creator_email !== req.user.email) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { campaign_title, campaign_story, reward_info } = req.body;
      campaign.campaign_title = campaign_title ?? campaign.campaign_title;
      campaign.campaign_story = campaign_story ?? campaign.campaign_story;
      campaign.reward_info = reward_info ?? campaign.reward_info;
      await campaign.save();
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/:id",
  verifyToken,
  requireRole("Creator"),
  async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign)
        return res.status(404).json({ message: "Campaign not found" });
      if (campaign.creator_email !== req.user.email) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const approved = await Contribution.find({
        campaign_id: campaign._id,
        status: "approved",
      });
      const refundTotal = approved.reduce(
        (sum, c) => sum + c.contribution_amount,
        0
      );
      for (const c of approved) {
        await User.findOneAndUpdate(
          { email: c.supporter_email },
          { $inc: { credits: c.contribution_amount } }
        );
      }
      await User.findOneAndUpdate(
        { email: campaign.creator_email },
        { $inc: { raised_credits: -refundTotal } }
      );
      await Campaign.findByIdAndDelete(req.params.id);
      res.json({ message: "Campaign deleted and contributors refunded" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/admin/pending",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      const campaigns = await Campaign.find({ status: "pending" });
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

const notify = async (message, toEmail, actionRoute) => {
  await Notification.create({ message, toEmail, actionRoute });
};

router.patch(
  "/:id/approve",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      const campaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        { status: "approved" },
        { new: true }
      );
      if (!campaign)
        return res.status(404).json({ message: "Campaign not found" });
      await notify(
        `Your campaign "${campaign.campaign_title}" has been approved by Admin and is now live.`,
        campaign.creator_email,
        "/dashboard/creator-home"
      );
      await sendEmail({
        to: campaign.creator_email,
        subject: "Your Clodfare campaign is live!",
        html: `<h3>Congratulations!</h3><p>Your campaign <b>${campaign.campaign_title}</b> has been approved and is now visible to supporters.</p>`,
      });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id/reject",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      const campaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        { status: "rejected" },
        { new: true }
      );
      if (!campaign)
        return res.status(404).json({ message: "Campaign not found" });
      await notify(
        `Your campaign "${campaign.campaign_title}" was rejected by Admin.`,
        campaign.creator_email,
        "/dashboard/creator-home"
      );
      await sendEmail({
        to: campaign.creator_email,
        subject: "Update on your Clodfare campaign",
        html: `<h3>Campaign update</h3><p>Your campaign <b>${campaign.campaign_title}</b> was rejected by our admin team. Please review our guidelines and try again.</p>`,
      });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/admin/all",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      const campaigns = await Campaign.find();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/admin/:id",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      await Campaign.findByIdAndDelete(req.params.id);
      res.json({ message: "Campaign deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id/suspend",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      const campaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        { suspended: true },
        { new: true }
      );
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
