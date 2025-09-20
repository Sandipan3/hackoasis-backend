import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    publicAddress: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    nonce: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
