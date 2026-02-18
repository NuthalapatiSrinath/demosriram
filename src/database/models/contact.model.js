// src/database/models/contact.model.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  selectedCenter: {
    type: String,
    required: true,
    enum: ["All Centers", "Delhi Center", "Mumbai Center", "Bangalore Center", "Hyderabad Center"],
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "contacted", "resolved"],
    default: "pending",
  },
  assignedTo: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
contactSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Contact", contactSchema);
