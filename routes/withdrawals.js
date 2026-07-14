import express from "express";
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "../utils/email.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

const todayStr = () => new Date().toISOString().split("T")[0];

router.get(
  "/creator",
  verifyToken,
  requireRole("Creator"),
  async (req, res) => {
    try {
      const withdrawals = await Withdrawal.find({
        creator_email: req.user.email,
      });
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get(
  "/creator/stats",
  verifyToken,
  requireRole("Creator"),
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.user.email });
      const raised = user?.raised_credits || 0;
      res.json({
        raisedCredits: raised,
        withdrawalDollars: raised / 20,
        canWithdraw: raised >= 200,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/",
  verifyToken,
  requireRole("Creator"),
  async (req, res) => {
    try {
      const {
        withdrawal_credit,
        withdrawal_amount,
        payment_system,
        account_number,
      } = req.body;
      const user = await User.findOne({ email: req.user.email });
      const raised = user?.raised_credits || 0;
      if (raised < 200) {
        return res
          .status(400)
          .json({ message: "Minimum 200 raised credits required" });
      }
      if (withdrawal_credit > raised) {
        return res
          .status(400)
          .json({ message: "Cannot withdraw more than raised credits" });
      }
      const withdrawal = await Withdrawal.create({
        creator_email: req.user.email,
        creator_name: req.user.name,
        withdrawal_credit,
        withdrawal_amount,
        payment_system,
        account_number,
        withdraw_date: todayStr(),
        status: "pending",
      });
      res.status(201).json(withdrawal);
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
      const withdrawals = await Withdrawal.find({ status: "pending" });
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.patch(
  "/:id/approve",
  verifyToken,
  requireRole("Admin"),
  async (req, res) => {
    try {
      const withdrawal = await Withdrawal.findById(req.params.id);
      if (!withdrawal)
        return res.status(404).json({ message: "Withdrawal not found" });
      withdrawal.status = "approved";
      await withdrawal.save();

      await User.findOneAndUpdate(
        { email: withdrawal.creator_email },
        { $inc: { raised_credits: -withdrawal.withdrawal_credit } }
      );

      await Notification.create({
        message: `Your withdrawal of ${withdrawal.withdrawal_amount} USD (${withdrawal.withdrawal_credit} credits) has been processed successfully.`,
        toEmail: withdrawal.creator_email,
        actionRoute: "/dashboard/payment-history",
      });
      await sendEmail({
        to: withdrawal.creator_email,
        subject: "Your withdrawal was processed",
        html: `<h3>Payment successful</h3><p>Your withdrawal of <b>$${withdrawal.withdrawal_amount}</b> (${withdrawal.withdrawal_credit} credits) via ${withdrawal.payment_system} has been processed.</p>`,
      });

      res.json(withdrawal);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
