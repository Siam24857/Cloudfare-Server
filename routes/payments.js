import express from "express";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

const todayStr = () => new Date().toISOString().split("T")[0];

router.get(
  "/supporter",
  verifyToken,
  requireRole("Supporter"),
  async (req, res) => {
    try {
      const payments = await Payment.find({
        supporter_email: req.user.email,
      }).sort({ createdAt: -1 });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.post(
  "/",
  verifyToken,
  requireRole("Supporter"),
  async (req, res) => {
    try {
      const { amount_paid, credits_added, transaction_id } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const payment = await Payment.create({
        supporter_email: user.email,
        supporter_name: user.name,
        amount_paid,
        credits_added,
        transaction_id: transaction_id || `txn_${Date.now()}`,
        date: todayStr(),
        status: "paid",
      });

      user.credits += Number(credits_added);
      await user.save();

      res.status(201).json({ payment, credits: user.credits });
    } catch (error) {
      console.error("PAYMENT CREATE ERROR:", error);
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
      const payments = await Payment.find().sort({ createdAt: -1 });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
