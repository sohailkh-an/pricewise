import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    userData: {
      email: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      fullName: {
        type: String,
        required: true,
      },
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Clean up expired documents
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification = mongoose.model(
  "EmailVerification",
  emailVerificationSchema
);

export default EmailVerification;

