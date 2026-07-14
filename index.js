import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import campaignRoutes from "./routes/campaigns.js";
import contributionRoutes from "./routes/contributions.js";
import withdrawalRoutes from "./routes/withdrawals.js";
import notificationRoutes from "./routes/notifications.js";
import paymentRoutes from "./routes/payments.js";
import reportRoutes from "./routes/reports.js";
import uploadRoutes from "./routes/upload.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "25mb" }));

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@clodfare.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: "Platform Admin",
      email: adminEmail,
      password: hashed,
      role: "Admin",
      credits: 0,
    });
    console.log(`Admin seeded: ${adminEmail} / ${adminPassword}`);
  }
};

app.get("/", (req, res) => {
  res.json({ message: "Clodfare API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/upload", uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const start = async () => {
  await connectDB();
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

export default app;
