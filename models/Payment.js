import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    supporter_email: { type: String, required: true },
    supporter_name: { type: String, required: true },
    amount_paid: { type: Number, required: true },
    credits_added: { type: Number, required: true },
    transaction_id: { type: String, default: "" },
    date: { type: String, required: true },
    status: { type: String, enum: ["paid", "failed"], default: "paid" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
