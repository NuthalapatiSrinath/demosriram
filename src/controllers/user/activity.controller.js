// src/controllers/user/activity.controller.js
import UserActivity from "../../database/models/userActivity.model.js";
import User from "../../database/models/user/user.model.js";

/**
 * @route   POST /api/user/activity/track
 * @desc    Track user activity
 * @access  Private (authenticated users)
 */
export const trackActivity = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const activityData = {
      user: userId,
      sessionId: req.body.sessionId || req.sessionID || `session_${Date.now()}`,
      activityType: req.body.activityType,
      page: req.body.page,
      action: req.body.action,
      scroll: req.body.scroll,
      course: req.body.course,
      device: {
        userAgent: req.headers["user-agent"],
        platform: req.body.device?.platform,
        isMobile: req.body.device?.isMobile,
        screenWidth: req.body.device?.screenWidth,
        screenHeight: req.body.device?.screenHeight,
      },
      location: {
        ip: req.ip || req.connection.remoteAddress,
        country: req.body.location?.country,
        city: req.body.location?.city,
      },
      duration: req.body.duration,
    };

    const activity = await UserActivity.create(activityData);

    return res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (err) {
    console.error("trackActivity error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to track activity",
    });
  }
};

/**
 * @route   POST /api/user/activity/batch
 * @desc    Track multiple activities in batch
 * @access  Private
 */
export const trackBatchActivities = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { activities } = req.body;
    if (!activities || !Array.isArray(activities)) {
      return res.status(400).json({
        success: false,
        message: "Activities array is required",
      });
    }

    const activitiesData = activities.map((activity) => ({
      user: userId,
      sessionId: activity.sessionId || req.sessionID || `session_${Date.now()}`,
      activityType: activity.activityType,
      page: activity.page,
      action: activity.action,
      scroll: activity.scroll,
      course: activity.course,
      device: {
        userAgent: req.headers["user-agent"],
        ...activity.device,
      },
      location: {
        ip: req.ip || req.connection.remoteAddress,
        ...activity.location,
      },
      duration: activity.duration,
      timestamp: activity.timestamp || new Date(),
    }));

    await UserActivity.insertMany(activitiesData);

    return res.status(201).json({
      success: true,
      message: `${activitiesData.length} activities tracked`,
    });
  } catch (err) {
    console.error("trackBatchActivities error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to track batch activities",
    });
  }
};

/**
 * @route   GET /api/user/activity/my-journey
 * @desc    Get user's activity journey
 * @access  Private
 */
export const getMyJourney = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { startDate, endDate, activityType, limit = 100 } = req.query;

    const query = { user: userId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (activityType) {
      query.activityType = activityType;
    }

    const activities = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({
      success: true,
      data: activities,
      count: activities.length,
    });
  } catch (err) {
    console.error("getMyJourney error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity journey",
    });
  }
};

/**
 * @route   GET /api/user/activity/stats
 * @desc    Get user activity statistics
 * @access  Private
 */
export const getMyStats = async (req, res) => {
  try {
    const userId = req.user?._id;

    // Get activity breakdown
    const activityBreakdown = await UserActivity.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$activityType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get engagement metrics
    const engagement = await UserActivity.getUserEngagement(userId);

    // Get most visited pages
    const topPages = await UserActivity.aggregate([
      { $match: { user: userId, activityType: "page_view" } },
      {
        $group: {
          _id: "$page.path",
          visits: { $sum: 1 },
          avgDuration: { $avg: "$duration" },
        },
      },
      { $sort: { visits: -1 } },
      { $limit: 10 },
    ]);

    // Get total stats
    const totalActivities = await UserActivity.countDocuments({ user: userId });
    const totalSessions = await UserActivity.distinct("sessionId", {
      user: userId,
    });

    return res.status(200).json({
      success: true,
      data: {
        totalActivities,
        totalSessions: totalSessions.length,
        activityBreakdown,
        engagement,
        topPages,
      },
    });
  } catch (err) {
    console.error("getMyStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity stats",
    });
  }
};

// Admin: Get user activity
export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      startDate,
      endDate,
      activityType,
      page = 1,
      limit = 50,
    } = req.query;

    const query = { user: userId };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (activityType) {
      query.activityType = activityType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [activities, total] = await Promise.all([
      UserActivity.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      UserActivity.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    console.error("getUserActivity error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user activity",
    });
  }
};

// Admin: Get all users' activity analytics
export const getActivityAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
      if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
    }

    // Popular pages
    const popularPages = await UserActivity.getPopularPages(20);

    // Activity trends by day
    const activityTrends = await UserActivity.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            type: "$activityType",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": -1 } },
    ]);

    // Top active users
    const topUsers = await UserActivity.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$user",
          activityCount: { $sum: 1 },
          uniqueSessions: { $addToSet: "$sessionId" },
        },
      },
      { $sort: { activityCount: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          name: "$userInfo.name",
          email: "$userInfo.email",
          activityCount: 1,
          sessionCount: { $size: "$uniqueSessions" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        popularPages,
        activityTrends,
        topUsers,
      },
    });
  } catch (err) {
    console.error("getActivityAnalytics error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity analytics",
    });
  }
};
