// src/controllers/admin/userActivity.controller.js
import UserActivity from "../../database/models/userActivity.model.js";
import User from "../../database/models/user/user.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/user-activities/users-list
// Returns ONE row per user with aggregated activity stats
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminUsersActivityList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      dateRange = "all",
      center,
      search,
    } = req.query;

    // Date filter
    const now = new Date();
    let startDate;
    if (dateRange === "today")
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (dateRange === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === "month") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }

    const matchQuery = {};
    if (startDate) matchQuery.timestamp = { $gte: startDate };

    // Aggregate: one record per user with stats
    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: "$user",
          totalActivities: { $sum: 1 },
          lastSeen: { $max: "$timestamp" },
          firstSeen: { $min: "$timestamp" },
          uniqueSessions: { $addToSet: "$sessionId" },
          activityTypes: { $addToSet: "$activityType" },
          pageViews: {
            $sum: { $cond: [{ $eq: ["$activityType", "page_view"] }, 1, 0] },
          },
          logins: {
            $sum: { $cond: [{ $eq: ["$activityType", "login"] }, 1, 0] },
          },
          scrolls: {
            $sum: { $cond: [{ $eq: ["$activityType", "scroll"] }, 1, 0] },
          },
          clicks: {
            $sum: { $cond: [{ $eq: ["$activityType", "button_click"] }, 1, 0] },
          },
          totalDuration: { $sum: { $ifNull: ["$duration", 0] } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          userId: "$_id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          phone: "$userInfo.phone",
          centerName: "$userInfo.centerName",
          role: "$userInfo.role",
          isVerified: "$userInfo.isVerified",
          totalActivities: 1,
          lastSeen: 1,
          firstSeen: 1,
          sessionCount: { $size: "$uniqueSessions" },
          activityTypes: 1,
          pageViews: 1,
          logins: 1,
          scrolls: 1,
          clicks: 1,
          totalDuration: 1,
        },
      },
    ];

    // Center filter post-lookup
    if (center && center !== "All Centers") {
      pipeline.push({ $match: { centerName: center } });
    }

    // Search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Count total before pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await UserActivity.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Sort and paginate
    pipeline.push({ $sort: { lastSeen: -1 } });
    pipeline.push({ $skip: (parseInt(page) - 1) * parseInt(limit) });
    pipeline.push({ $limit: parseInt(limit) });

    const users = await UserActivity.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (err) {
    console.error("getAdminUsersActivityList error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching users activity list",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/user-activities/user/:userId
// Returns full detail for a single user: info, stats, timeline, charts data
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminUserActivityDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 30, dateRange = "all" } = req.query;

    const userInfo = await User.findById(userId).select("-password");
    if (!userInfo)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const now = new Date();
    let startDate;
    if (dateRange === "today")
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (dateRange === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === "month") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }

    const matchQuery = { user: userInfo._id };
    if (startDate) matchQuery.timestamp = { $gte: startDate };

    // Activity breakdown by type
    const activityBreakdown = await UserActivity.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$activityType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Activity by hour (for heatmap)
    const activityByHour = await UserActivity.aggregate([
      { $match: matchQuery },
      { $group: { _id: { $hour: "$timestamp" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Activity by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activityByDay = await UserActivity.aggregate([
      { $match: { user: userInfo._id, timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top pages visited
    const topPages = await UserActivity.aggregate([
      { $match: { ...matchQuery, activityType: "page_view" } },
      {
        $group: {
          _id: "$page.title",
          count: { $sum: 1 },
          path: { $first: "$page.path" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Mouse/scroll/click stats
    const interactionStats = await UserActivity.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalScrolls: {
            $sum: { $cond: [{ $eq: ["$activityType", "scroll"] }, 1, 0] },
          },
          totalClicks: {
            $sum: { $cond: [{ $eq: ["$activityType", "button_click"] }, 1, 0] },
          },
          totalHovers: {
            $sum: { $cond: [{ $eq: ["$activityType", "hover"] }, 1, 0] },
          },
          totalPageViews: {
            $sum: { $cond: [{ $eq: ["$activityType", "page_view"] }, 1, 0] },
          },
          totalLogins: {
            $sum: { $cond: [{ $eq: ["$activityType", "login"] }, 1, 0] },
          },
          totalDuration: { $sum: { $ifNull: ["$duration", 0] } },
          avgDuration: { $avg: { $ifNull: ["$duration", 0] } },
          uniqueSessions: { $addToSet: "$sessionId" },
        },
      },
    ]);

    // Device info
    const deviceInfo = await UserActivity.findOne({ user: userInfo._id })
      .sort({ timestamp: -1 })
      .select("device location");

    // Paginated timeline
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [timeline, totalActivities] = await Promise.all([
      UserActivity.find(matchQuery)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      UserActivity.countDocuments(matchQuery),
    ]);

    const stats = interactionStats[0] || {};

    return res.status(200).json({
      success: true,
      data: {
        user: userInfo,
        stats: {
          totalActivities,
          sessionCount: stats.uniqueSessions?.length || 0,
          totalScrolls: stats.totalScrolls || 0,
          totalClicks: stats.totalClicks || 0,
          totalHovers: stats.totalHovers || 0,
          totalPageViews: stats.totalPageViews || 0,
          totalLogins: stats.totalLogins || 0,
          totalDuration: stats.totalDuration || 0,
          avgDuration: Math.round(stats.avgDuration || 0),
        },
        activityBreakdown,
        activityByHour,
        activityByDay,
        topPages,
        deviceInfo,
        timeline,
        totalPages: Math.ceil(totalActivities / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("getAdminUserActivityDetail error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching user activity detail",
    });
  }
};

// GET /api/admin/user-activities
export const getAdminUserActivities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      dateRange = "today",
      center,
      type,
      search,
    } = req.query;
    const query = {};

    // Date range filter
    const now = new Date();
    let startDate;
    if (dateRange === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateRange === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === "month") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    }
    if (startDate) {
      query.timestamp = { $gte: startDate };
    }

    // Center filter (if user model has centerName)
    if (center) {
      const users = await User.find({ centerName: center }).select("_id");
      query.user = { $in: users.map((u) => u._id) };
    }

    // Activity type filter
    if (type && type !== "all") {
      query.activityType = type;
    }

    // Search by user name or email
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      query.user = { $in: users.map((u) => u._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const activities = await UserActivity.find(query)
      .populate("user", "name email centerName role")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await UserActivity.countDocuments(query);

    // Stats
    const uniqueUsers = await UserActivity.distinct("user", query);
    const topActions = await UserActivity.aggregate([
      { $match: query },
      { $group: { _id: "$activityType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const avgTime = await UserActivity.aggregate([
      { $match: query },
      { $group: { _id: null, avg: { $avg: "$duration" } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        activities,
        totalPages: Math.ceil(total / parseInt(limit)),
        stats: {
          totalActivities: total,
          uniqueUsers: uniqueUsers.length,
          avgTime: avgTime[0]?.avg || 0,
          topActions,
        },
      },
    });
  } catch (err) {
    console.error("getAdminUserActivities error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user activities",
    });
  }
};

// GET /api/admin/user-activities/stats
export const getAdminUserActivityStats = async (req, res) => {
  try {
    // Example: return total activities, unique users, etc.
    const totalActivities = await UserActivity.countDocuments();
    const uniqueUsers = await UserActivity.distinct("user");
    return res.status(200).json({
      success: true,
      data: {
        totalActivities,
        uniqueUsers: uniqueUsers.length,
      },
    });
  } catch (err) {
    console.error("getAdminUserActivityStats error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity stats",
    });
  }
};

// GET /api/admin/user-activities/activities/:userId
// Detailed activities with advanced filtering
export const getAdminUserActivitiesDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 50,
      timeRange = "7days",
      activityType,
      search,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = req.query;

    // Verify user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build query
    const query = { user: userId };

    // Time range filter
    const now = new Date();
    let startDate;
    if (timeRange === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeRange === "3days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 3);
    } else if (timeRange === "7days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "30days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === "90days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 90);
    }
    if (startDate) {
      query.timestamp = { $gte: startDate };
    }

    // Activity type filter
    if (activityType && activityType !== "all") {
      query.activityType = activityType;
    }

    // Search filter
    if (search) {
      query.$or = [
        { url: { $regex: search, $options: "i" } },
        { "page.title": { $regex: search, $options: "i" } },
        { "button.text": { $regex: search, $options: "i" } },
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Paginate
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [activities, total] = await Promise.all([
      UserActivity.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      UserActivity.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        activities,
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (err) {
    console.error("getAdminUserActivitiesDetail error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching user activities",
    });
  }
};

// GET /api/admin/user-activities/sessions/:userId
// Session tracking data
export const getAdminUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = "7days" } = req.query;

    // Verify user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build query
    const query = { user: userId };

    // Time range filter
    const now = new Date();
    let startDate;
    if (timeRange === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeRange === "3days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 3);
    } else if (timeRange === "7days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "30days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === "90days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 90);
    }
    if (startDate) {
      query.timestamp = { $gte: startDate };
    }

    // Group activities into sessions
    const activities = await UserActivity.find(query).sort({ timestamp: 1 });

    const sessions = [];
    let currentSession = null;
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    activities.forEach((activity) => {
      const activityTime = new Date(activity.timestamp).getTime();

      if (
        !currentSession ||
        activityTime - currentSession.lastActivityTime > SESSION_TIMEOUT ||
        (activity.sessionId && activity.sessionId !== currentSession.sessionId)
      ) {
        // Start new session
        if (currentSession) {
          sessions.push(currentSession);
        }
        currentSession = {
          sessionId: activity.sessionId || `session-${sessions.length + 1}`,
          startTime: activity.timestamp,
          lastActivityTime: activityTime,
          endTime: activity.timestamp,
          duration: 0,
          activityCount: 1,
          activities: [activity.activityType],
        };
      } else {
        // Continue current session
        currentSession.endTime = activity.timestamp;
        currentSession.lastActivityTime = activityTime;
        currentSession.duration =
          (activityTime - new Date(currentSession.startTime).getTime()) / 1000;
        currentSession.activityCount += 1;
        currentSession.activities.push(activity.activityType);
      }
    });

    // Add last session
    if (currentSession) {
      sessions.push(currentSession);
    }

    return res.status(200).json({
      success: true,
      data: {
        sessions,
        totalSessions: sessions.length,
        totalTime: sessions.reduce((sum, s) => sum + s.duration, 0),
      },
    });
  } catch (err) {
    console.error("getAdminUserSessions error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching user sessions",
    });
  }
};
