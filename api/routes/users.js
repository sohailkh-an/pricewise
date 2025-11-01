import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import EmailVerification from "../models/EmailVerification.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  sendVerificationCodeEmail,
  sendPasswordResetEmail,
} from "../utils/emailService.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await EmailVerification.deleteMany({ email: email.toLowerCase() });

    const emailVerification = new EmailVerification({
      email: email.toLowerCase(),
      code: verificationCode,
      userData: {
        email: email.toLowerCase(),
        password,
        fullName,
      },
      expiresAt,
    });

    await emailVerification.save();

    const emailResult = await sendVerificationCodeEmail({
      to: email,
      code: verificationCode,
      fullName,
    });

    if (!emailResult.success) {
      await EmailVerification.deleteOne({ _id: emailVerification._id });
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email. Please check your inbox.",
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const emailVerification = await EmailVerification.findOne({
      email: email.toLowerCase(),
      code: code,
      expiresAt: { $gt: new Date() },
    });

    if (!emailVerification) {
      const expiredVerification = await EmailVerification.findOne({
        email: email.toLowerCase(),
        code: code,
      });

      if (expiredVerification) {
        return res.status(400).json({
          success: false,
          message: "Verification code has expired. Please request a new one.",
        });
      }

      const verificationAttempt = await EmailVerification.findOne({
        email: email.toLowerCase(),
      });

      if (verificationAttempt) {
        verificationAttempt.attempts += 1;
        await verificationAttempt.save();

        if (verificationAttempt.attempts >= verificationAttempt.maxAttempts) {
          await EmailVerification.deleteOne({ _id: verificationAttempt._id });
          return res.status(400).json({
            success: false,
            message:
              "Too many failed attempts. Please request a new verification code.",
          });
        }
      }

      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please try again.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await EmailVerification.deleteOne({ _id: emailVerification._id });
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = new User({
      email: emailVerification.userData.email,
      password: emailVerification.userData.password,
      fullName: emailVerification.userData.fullName,
      isEmailVerified: true,
    });

    await user.save();

    await EmailVerification.deleteOne({ _id: emailVerification._id });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "Email verified successfully. Account created!",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    });
  } catch (error) {
    console.error("Email verification error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/resend-verification-code", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const existingVerification = await EmailVerification.findOne({
      email: email.toLowerCase(),
    });

    if (!existingVerification) {
      return res.status(404).json({
        success: false,
        message:
          "No pending registration found for this email. Please register first.",
      });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    existingVerification.code = verificationCode;
    existingVerification.expiresAt = expiresAt;
    existingVerification.attempts = 0;
    await existingVerification.save();

    const emailResult = await sendVerificationCodeEmail({
      to: email,
      code: verificationCode,
      fullName: existingVerification.userData.fullName,
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.json({
      success: true,
      message:
        "Verification code resent to your email. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification code error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/me", authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already taken",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset link.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const emailResult = await sendPasswordResetEmail({
      to: email,
      resetUrl,
      fullName: user.fullName,
    });

    if (!emailResult.success) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later.",
      });
    }

    res.json({
      success: true,
      message:
        "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
