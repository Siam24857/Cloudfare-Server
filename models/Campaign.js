import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    campaign_title: { type: String, required: true },
    campaign_story: { type: String, required: true },
    category: { type: String, required: true },
    funding_goal: { type: Number, required: true },
    minimum_contribution: { type: Number, required: true },
    deadline: { type: String, required: true },
    reward_info: { type: String, required: true },
    campaign_image_url: { type: String, default: "" },
    creator_email: { type: String, required: true },
    creator_name: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    suspended: { type: Boolean, default: false },
    amount_raised: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);
