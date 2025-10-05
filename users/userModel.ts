import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
