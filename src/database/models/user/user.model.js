// src/database/models/user/user.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { config } from "../../../config/index.js"; // from src/database/models/user -> src/config

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return !v || /^[0-9]{10}$/.test(v);
      },
      message: "Phone number must be 10 digits",
    },
  },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin", "centeradmin", "staff"],
    default: "user",
  },
  centerName: {
    type: String,
    enum: [
      "All Centers",
      "Delhi Center",
      "Mumbai Center",
      "Bangalore Center",
      "Hyderabad Center",
      null,
    ],
    default: null,
  },
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String, select: false, index: true },
  resetPasswordExpires: { type: Date, select: false },
});

// Pre-save hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const rounds = config.security.bcryptSaltRounds ?? 12;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

userSchema.methods.validatePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generatePasswordReset = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return token;
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 3600000; // 24 hours
  return token;
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.__v;
  return obj;
};

export default mongoose.model("User", userSchema);
