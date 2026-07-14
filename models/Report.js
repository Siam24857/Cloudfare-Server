import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    campaign_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    campaign_title: { type: String, required: true },
    reporter_email: { type: String, required: true },
    reporter_name: { type: String, required: true },
    reason: { type: String, required: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
