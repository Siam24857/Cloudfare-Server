import nodemailer from "nodemailer";

const config = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
  from: process.env.EMAIL_FROM || "Clodfare <no-reply@clodfare.com>",
};

const enabled = !!(config.host && config.auth);

const transporter = enabled ? nodemailer.createTransport(config) : null;

export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log(`[email:disabled] -> ${to} | ${subject}`);
    return false;
  }
  try {
    await transporter.sendMail({ from: config.from, to, subject, html });
    return true;
  } catch (error) {
    console.error("Email send failed:", error.message);
    return false;
  }
};

export const emailEnabled = enabled;
