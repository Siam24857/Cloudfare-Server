import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photoURL: { type: String, default: "" },
    password: { type: String, default: "" },
    role: {
      type: String,
      enum: ["Supporter", "Creator", "Admin"],
      default: "Supporter",
    },
    credits: { type: Number, default: 0 },
    raised_credits: { type: Number, default: 0 },
    firebaseUID: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
