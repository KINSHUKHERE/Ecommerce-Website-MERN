const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
    },

    vendorStatus: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "active",
    },

    phoneNumber: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: "",
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    businessName: {
      type: String,
      default: "",
    },

    businessAddress: {
      type: String,
      default: "",
    },

    gstin: {
      type: String,
      default: "",
    },

    agreedToCommissionTerms: {
      type: Boolean,
      default: false,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    minWalletBalance: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);