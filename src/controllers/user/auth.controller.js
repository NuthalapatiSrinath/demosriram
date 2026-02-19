// src/controllers/user/auth.controller.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../../database/models/user/user.model.js";
import RefreshToken from "../../database/models/refreshToken.model.js";
import { config } from "../../config/index.js";
import sendEmail from "../../utils/email.js";
import { forgotPasswordEmail } from "../../utils/forgotPasswordMailPage.js";
import { logAuthEvent } from "../../middleware/activityTracker.js";

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
 * @route   POST /api/user/auth/register
 * @desc    Register new user
 * @access  Public
 */
export const registerController = async (req, res) => {
  try {
    const { name, email, phone, centerName, password, confirmPassword } =
      req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Phone validation (if provided)
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
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

    // Create user (password will be hashed by pre-save middleware)
    const userData = {
      name,
      email,
      password,
      role: "user", // Users can only register as 'user' role
      isVerified: false, // Email verification pending
    };

    // Add optional fields if provided
    if (phone) userData.phone = phone;
    if (centerName) userData.centerName = centerName;

    const user = await User.create(userData);

    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email (non-blocking)
    setImmediate(async () => {
      try {
        const verificationUrl = `${config.app.frontendUrl}/verify-email?token=${verificationToken}`;
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify Your Email</title>
          <style>
            body { background-color: #f4f4f7; font-family: 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; color: #333333; }
            .container { width: 100%; padding: 40px 0; }
            .email-wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { background-color: #0d6efd; color: #ffffff; text-align: center; padding: 20px; }
            .header h1 { margin: 0; font-size: 22px; letter-spacing: 0.5px; }
            .content { padding: 30px 40px; }
            .content h2 { font-size: 20px; color: #333333; margin-bottom: 16px; }
            .content p { line-height: 1.6; margin-bottom: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #0d6efd; color: #ffffff !important; border-radius: 6px; text-decoration: none; font-weight: 600; transition: background-color 0.3s ease; }
            .button:hover { background-color: #0b5ed7; }
            .footer { text-align: center; font-size: 13px; color: #888888; padding: 20px; border-top: 1px solid #eeeeee; }
            @media (max-width: 600px) { .content { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <h1>Email Verification</h1>
              </div>
              <div class="content">
                <h2>Hello ${user.name || "User"},</h2>
                <p>Thank you for registering! Please verify your email address by clicking the button below.</p>
                <p style="text-align: center;">
                  <a href="${verificationUrl}" class="button" target="_blank">Verify Email</a>
                </p>
                <p>If you did not create an account, you can safely ignore this email.</p>
                <p>For security reasons, this link will expire in <strong>24 hours</strong>.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
        `;
        await sendEmail({
          to: user.email,
          subject: "Verify Your Email",
          text: `Please verify your email: ${verificationUrl}`,
          html,
        });
        console.info(`Verification email sent to ${user.email}`);
      } catch (emailErr) {
        console.error("Failed to send verification email:", emailErr);
      }
    });

    // Prepare response without sensitive data
    const userObj = user.toJSON();

    // Log registration event
    logAuthEvent(user._id, "register", {
      userAgent: req.headers["user-agent"],
      ip: req.ip || req.connection.remoteAddress,
      email: user.email,
    }).catch((err) => console.error("Failed to log register event:", err));

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      data: userObj,
    });
  } catch (err) {
    console.error("registerController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

/**
 * @route   POST /api/user/auth/login
 * @desc    Login user and return tokens
 * @access  Public
 */
export const loginController = async (req, res) => {
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
        message: "Invalid email or password",
      });
    }

    // Check if email is verified
    if (!user.isVerified && user.role === "user") {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
      });
    }

    // Validate password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
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

    console.log(`✅ Login successful for user ${user._id} (${user.email})`);
    console.log(
      `   Access token (first 20 chars): ${accessToken.substring(0, 20)}...`,
    );
    console.log(
      `   Refresh token (first 20 chars): ${refreshToken.substring(0, 20)}...`,
    );

    // Store refresh token in database
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    );

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt,
      createdByIp: req.ip || req.connection.remoteAddress,
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log login event
    logAuthEvent(user._id, "login", {
      userAgent: req.headers["user-agent"],
      ip: req.ip || req.connection.remoteAddress,
      email: user.email,
    }).catch((err) => console.error("Failed to log login event:", err));

    // Set refresh token in httpOnly cookie
    res.cookie(config.jwt.refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: config.jwt.refreshCookieSecure, // true in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        accessToken,
      },
    });
  } catch (err) {
    console.error("loginController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/**
 * @route   POST /api/user/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (but requires valid refresh token)
 */
export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken =
      req.cookies[config.jwt.refreshCookieName] || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    // Verify refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Check if refresh token exists in database and is active
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.revokedByIp) {
      return res.status(401).json({
        success: false,
        message: "Refresh token revoked or not found",
      });
    }

    if (storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    // Get user
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      sub: user._id,
      role: user.role,
      email: user.email,
    });

    console.log(
      `🔄 Generated new access token for user ${user._id} (${user.email})`,
    );
    console.log(
      `   Token (first 20 chars): ${newAccessToken.substring(0, 20)}...`,
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    console.error("refreshTokenController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during token refresh",
    });
  }
};

/**
 * @route   POST /api/user/auth/logout
 * @desc    Logout user and revoke refresh token
 * @access  Protected
 */
export const logoutController = async (req, res) => {
  try {
    const refreshToken =
      req.cookies[config.jwt.refreshCookieName] || req.body.refreshToken;

    if (refreshToken) {
      // Revoke refresh token in database
      await RefreshToken.findOneAndUpdate(
        { token: refreshToken },
        { revokedByIp: req.ip || req.connection.remoteAddress },
      );
    }

    // Clear refresh token cookie
    res.clearCookie(config.jwt.refreshCookieName);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    console.error("logoutController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

/**
 * @route   POST /api/user/auth/change-password
 * @desc    Change user password (requires authentication)
 * @access  Protected
 */
export const changePasswordController = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Get user with password
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Revoke all refresh tokens for security
    await RefreshToken.updateMany(
      { user: userId, revokedByIp: null },
      { revokedByIp: req.ip || req.connection.remoteAddress },
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (err) {
    console.error("changePasswordController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during password change",
    });
  }
};

/**
 * @route   POST /api/user/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    // Always return success to prevent user enumeration
    if (!user) {
      console.info(`Password reset requested for non-existing email: ${email}`);
      return res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link will be sent",
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordReset();
    await user.save({ validateBeforeSave: false });

    // Log token for testing (remove in production)
    console.info(`Password reset token for ${email}: ${resetToken}`);

    // Send reset email (non-blocking)
    setImmediate(async () => {
      try {
        const resetUrl = `${config.app.frontendUrl}/reset-password?token=${resetToken}`;
        await sendEmail({
          to: user.email,
          subject: "Password Reset Request",
          text: `Reset your password: ${resetUrl}`,
          html: forgotPasswordEmail(resetUrl, user.name),
        });
        console.info(`Reset email sent to ${user.email}`);
      } catch (emailErr) {
        console.error("Failed to send reset email:", emailErr);
      }
    });

    return res.status(200).json({
      success: true,
      message: "If the email exists, a password reset link will be sent",
    });
  } catch (err) {
    console.error("forgotPasswordController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset request",
    });
  }
};

/**
 * @route   POST /api/user/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
export const resetPasswordController = async (req, res) => {
  try {
    const { token, newPassword, confirmNewPassword } = req.body;

    if (!token || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Revoke all refresh tokens
    await RefreshToken.updateMany(
      { user: user._id, revokedByIp: null },
      { revokedByIp: req.ip || req.connection.remoteAddress },
    );

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. Please login with your new password.",
    });
  } catch (err) {
    console.error("resetPasswordController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

/**
 * @route   POST /api/user/auth/verify-email
 * @desc    Verify user email
 * @access  Public
 */
export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Find user with valid verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Mark email as verified
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Log email verification event
    logAuthEvent(user._id, "email_verified", {
      userAgent: req.headers["user-agent"],
      ip: req.ip || req.connection.remoteAddress,
      email: user.email,
    }).catch((err) =>
      console.error("Failed to log email_verified event:", err),
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (err) {
    console.error("verifyEmailController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

/**
 * @route   GET /api/user/auth/me
 * @desc    Get current user profile
 * @access  Protected
 */
export const getMeController = async (req, res) => {
  try {
    const userId = req.user.sub;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  } catch (err) {
    console.error("getMeController error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
