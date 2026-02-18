// src/database/models/userActivity.model.js
import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  activityType: {
    type: String,
    enum: [
      "register",
      "email_verified",
      "login",
      "logout",
      "page_view",
      "scroll",
      "button_click",
      "form_submit",
      "course_view",
      "course_enroll",
      "video_play",
      "video_pause",
      "video_complete",
      "test_start",
      "test_submit",
      "download",
      "search",
      "filter",
      "contact_submit",
      "profile_update",
      "password_change",
      "other",
    ],
    required: true,
    index: true,
  },
  page: {
    path: { type: String },
    title: { type: String },
    referrer: { type: String },
  },
  action: {
    element: { type: String },
    value: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  scroll: {
    depth: { type: Number },
    maxDepth: { type: Number },
  },
  course: {
    courseId: { type: String },
    courseName: { type: String },
    section: { type: String },
    progress: { type: Number },
  },
  device: {
    userAgent: { type: String },
    platform: { type: String },
    isMobile: { type: Boolean },
    screenWidth: { type: Number },
    screenHeight: { type: Number },
  },
  location: {
    ip: { type: String },
    country: { type: String },
    city: { type: String },
  },
  duration: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Indexes for efficient querying
userActivitySchema.index({ user: 1, timestamp: -1 });
userActivitySchema.index({ activityType: 1, timestamp: -1 });
userActivitySchema.index({ sessionId: 1, timestamp: -1 });
userActivitySchema.index({ "page.path": 1, timestamp: -1 });

// Virtual for time spent
userActivitySchema.virtual("timeSpent").get(function () {
  return this.duration ? Math.round(this.duration / 1000) : 0;
});

// Method to get user journey
userActivitySchema.statics.getUserJourney = async function (
  userId,
  startDate,
  endDate,
) {
  return this.find({
    user: userId,
    timestamp: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate || new Date(),
    },
  })
    .sort({ timestamp: 1 })
    .lean();
};

// Method to get popular pages
userActivitySchema.statics.getPopularPages = async function (limit = 10) {
  return this.aggregate([
    { $match: { activityType: "page_view" } },
    {
      $group: {
        _id: "$page.path",
        count: { $sum: 1 },
        avgDuration: { $avg: "$duration" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
};

// Method to get user engagement metrics
userActivitySchema.statics.getUserEngagement = async function (userId) {
  const activities = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
        },
        sessionCount: { $addToSet: "$sessionId" },
        pageViews: { $sum: 1 },
        totalDuration: { $sum: "$duration" },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 30 },
  ]);

  return activities.map((a) => ({
    date: a._id,
    sessions: a.sessionCount.length,
    pageViews: a.pageViews,
    avgDuration: Math.round(a.totalDuration / a.pageViews / 1000),
  }));
};

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

export default UserActivity;
