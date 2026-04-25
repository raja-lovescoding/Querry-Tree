import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      default: "",
      trim: true,
    },
    photoURL: {
      type: String,
      default: "",
      trim: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;