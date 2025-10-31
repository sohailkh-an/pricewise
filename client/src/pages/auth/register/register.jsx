import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const navigate = useNavigate();
  const { register, verifyEmail, resendVerificationCode } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=])[A-Za-z\d!@#$%^&*()_\-+=]{8,}$/;

    return passwordRegex.test(password);
  };

  const validateFullName = (name) => {
    return name.trim().length >= 2 && name.trim().length <= 100;
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters long";
        } else if (!validatePassword(value)) {
          error =
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      case "fullName":
        if (!value.trim()) {
          error = "Full name is required";
        } else if (!validateFullName(value)) {
          error = "Full name must be between 2 and 100 characters";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");

    const fieldError = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const newFieldErrors = {};
    let hasErrors = false;

    if (!formData.email.trim()) {
      newFieldErrors.email = "Email is required";
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      newFieldErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    if (!formData.password) {
      newFieldErrors.password = "Password is required";
      hasErrors = true;
    } else if (formData.password.length < 8) {
      newFieldErrors.password = "Password must be at least 8 characters long";
      hasErrors = true;
    } else if (!validatePassword(formData.password)) {
      newFieldErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
      hasErrors = true;
    }

    if (!formData.confirmPassword) {
      newFieldErrors.confirmPassword = "Please confirm your password";
      hasErrors = true;
    } else if (formData.password !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = "Passwords do not match";
      hasErrors = true;
    }

    if (!formData.fullName.trim()) {
      newFieldErrors.fullName = "Full name is required";
      hasErrors = true;
    } else if (!validateFullName(formData.fullName)) {
      newFieldErrors.fullName =
        "Full name must be between 2 and 100 characters";
      hasErrors = true;
    }

    setFieldErrors(newFieldErrors);

    if (hasErrors) {
      setIsLoading(false);
      return;
    }

    try {
      const { success, message } = await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      });

      if (success) {
        setPendingEmail(formData.email);
        setShowVerificationStep(true);
        setError("");
      } else {
        setError(message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError("");

    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      setIsVerifying(false);
      return;
    }

    if (verificationCode.length !== 6) {
      setError("Verification code must be 6 digits");
      setIsVerifying(false);
      return;
    }

    try {
      const { success, message } = await verifyEmail(
        pendingEmail,
        verificationCode
      );

      if (success) {
        navigate("/");
        window.location.reload();
      } else {
        setError(message || "Verification failed. Please try again.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred during verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError("");

    try {
      const { success, message } = await resendVerificationCode(pendingEmail);

      if (success) {
        setError("");
        alert(message || "Verification code resent successfully!");
      } else {
        setError(message || "Failed to resend verification code.");
      }
    } catch (err) {
      console.error("Resend code error:", err);
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
    if (error) setError("");
  };

  if (showVerificationStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
        <Card className="w-full max-w-md" size="auth">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              We've sent a 6-digit code to {pendingEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  required
                  disabled={isVerifying}
                  className="w-full text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying || verificationCode.length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="inline mr-2 h-3 w-3 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    "Resend Code"
                  )}
                </button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationStep(false);
                    setVerificationCode("");
                    setError("");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ← Back to registration
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <Card className="w-full max-w-md" size="auth">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sign up to get started with Pricewise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Shahid Ali"
                required
                disabled={isLoading}
                className={`w-full ${
                  fieldErrors.fullName ? "border-red-500" : ""
                }`}
              />
              {fieldErrors.fullName && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="shahid@example.com"
                required
                disabled={isLoading}
                className={`w-full ${
                  fieldErrors.email ? "border-red-500" : ""
                }`}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className={`w-full pr-10 ${
                    fieldErrors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.password}
                </p>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Password must contain at least 8 characters with uppercase,
                lowercase, number, and special character
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                  className={`w-full pr-10 ${
                    fieldErrors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
