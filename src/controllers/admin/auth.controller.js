// src/controllers/admin/auth.controller.js
import jwt from "jsonwebtoken";
import User from "../../database/models/user/user.model.js";
import RefreshToken from "../../database/models/refreshToken.model.js";
import { config } from "../../config/index.js";

/**
 * Generate Access Token (short-lived)
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires,
  });
}

/**
 * Generate Refresh Token (long-lived)
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires,
  });
}

/**
 * @route   POST /api/admin/auth/login
 * @desc    Admin login
 * @access  Public
 */
export const adminLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is admin, superadmin, centeradmin, or staff
    const allowedRoles = ["admin", "superadmin", "centeradmin", "staff"];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Validate password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      sub: user._id,
      role: user.role,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      sub: user._id,
      role: user.role,
    });

    // Store refresh token in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt,
      createdByIp: req.ip || req.connection.remoteAddress,
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set refresh token in httpOnly cookie
    res.cookie(config.jwt.refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: config.jwt.refreshCookieSecure,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (err) {
    console.error("adminLoginController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during admin login",
    });
  }
};

/**
 * @route   POST /api/admin/auth/logout
 * @desc    Admin logout
 * @access  Protected (Admin)
 */
export const adminLogoutController = async (req, res) => {
  try {
    const refreshToken =
      req.cookies[config.jwt.refreshCookieName] || req.body.refreshToken;

    if (refreshToken) {
      // Revoke refresh token
      await RefreshToken.findOneAndUpdate(
        { token: refreshToken },
        { revokedByIp: req.ip || req.connection.remoteAddress },
      );
    }

    // Clear cookie
    res.clearCookie(config.jwt.refreshCookieName);

    return res.status(200).json({
      success: true,
      message: "Admin logout successful",
    });
  } catch (err) {
    console.error("adminLogoutController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during admin logout",
    });
  }
};

/**
 * @route   GET /api/admin/auth/me
 * @desc    Get current admin profile
 * @access  Protected (Admin)
 */
export const getAdminMeController = async (req, res) => {
  try {
    const userId = req.user.sub;

    const user = await User.findById(userId);
    const allowedRoles = ["admin", "superadmin", "centeradmin", "staff"];
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  } catch (err) {
    console.error("getAdminMeController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @route   POST /api/admin/auth/create-admin
 * @desc    Create new admin user (Super Admin only)
 * @access  Protected (Super Admin)
 */
export const createAdminController = async (req, res) => {
  try {
    const { name, email, password, role, centerName } = req.body;

    // Only super admin can create other admins
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only super admin can create admin users",
      });
    }

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate role
    const allowedRoles = ["admin", "superadmin", "centeradmin", "staff"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // If role is centeradmin, centerName is required
    if (role === "centeradmin" && !centerName) {
      return res.status(400).json({
        success: false,
        message: "Center name is required for center admin",
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password,
      role,
      centerName: role === "centeradmin" ? centerName : null,
      isVerified: true, // Admins are auto-verified
    });

    return res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      data: admin.toJSON(),
    });
  } catch (err) {
    console.error("createAdminController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during admin creation",
    });
  }
};
