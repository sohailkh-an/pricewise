import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import EmailVerification from "../models/EmailVerification.js";
import { authenticateToken } from "../middleware/auth.js";
import { Resend } from "resend";
import { sendVerificationCodeEmail } from "../utils/emailService.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and full name are required",
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing verification entries for this email
    await EmailVerification.deleteMany({ email: email.toLowerCase() });

    // Store verification code and user data temporarily
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

    // Send verification email
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

    // Find the verification entry
    const emailVerification = await EmailVerification.findOne({
      email: email.toLowerCase(),
      code: code,
      expiresAt: { $gt: new Date() },
    });

    if (!emailVerification) {
      // Check if it exists but expired
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

      // Check if max attempts reached
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

    // Check if user already exists (edge case)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await EmailVerification.deleteOne({ _id: emailVerification._id });
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create the user
    const user = new User({
      email: emailVerification.userData.email,
      password: emailVerification.userData.password,
      fullName: emailVerification.userData.fullName,
      isEmailVerified: true,
    });

    await user.save();

    // Delete the verification entry
    await EmailVerification.deleteOne({ _id: emailVerification._id });

    // Generate JWT token
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if there's a pending verification
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

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    existingVerification.code = verificationCode;
    existingVerification.expiresAt = expiresAt;
    existingVerification.attempts = 0; // Reset attempts
    await existingVerification.save();

    // Send verification email
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
      message: "Verification code resent to your email. Please check your inbox.",
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

const resend = new Resend(process.env.RESEND_API_KEY);

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

    try {
      await resend.emails.send({
        from: "Pricewise <noreply@pricewise.com>",
        to: [email],
        subject: "Password Reset Request - Pricewise",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669; text-align: center;">Password Reset Request</h2>
            <p>Hello ${user.fullName},</p>
            <p>You requested a password reset for your Pricewise account. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>This link will expire in 15 minutes for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              This email was sent from Pricewise. If you have any questions, please contact our support team.
            </p>
          </div>
        `,
      });

      res.json({
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset link.",
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);

      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again later.",
      });
    }
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

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
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
