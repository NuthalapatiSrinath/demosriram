// src/controllers/admin/users.controller.js
import User from "../../database/models/user/user.model.js";

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (with pagination)
 * @access  Protected (Admin)
 */
export const getAllUsersController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role } = req.query;

    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by role
    if (role && ["user", "admin"].includes(role)) {
      query.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-password")
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    console.error("getAllUsersController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Protected (Admin)
 */
export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("getUserByIdController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
};

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Protected (Admin)
 */
export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isVerified } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ["user", "admin"].includes(role)) user.role = role;
    if (typeof isVerified === "boolean") user.isVerified = isVerified;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user.toJSON(),
    });
  } catch (err) {
    console.error("updateUserController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating user",
    });
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Protected (Admin)
 */
export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("deleteUserController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics
 * @access  Protected (Admin)
 */
export const getUserStatsController = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    // Users registered in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        verifiedUsers,
        unverifiedUsers,
        recentUsers,
        total: totalUsers + totalAdmins,
      },
    });
  } catch (err) {
    console.error("getUserStatsController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user statistics",
    });
  }
};
