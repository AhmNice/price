// pages/Register.tsx
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Loader2
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/AuthStore";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loading: authLoading, isAuthenticated } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState("");

  const from = (location.state as any)?.from || "/products";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const checkPasswordStrength = (pwd: string) => {
    setPasswordStrength({
      length: pwd.length >= 6,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    checkPasswordStrength(pwd);
    // Clear errors when user starts typing
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Name validation
    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.length < 2) {
      errors.name = "Name must be at least 2 characters long";
    } else if (name.length > 50) {
      errors.name = "Name must be less than 50 characters";
    }

    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain at least one number";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password = "Password must contain at least one special character";
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess("");

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    const result = await register({ name, email, password });

    if (result.success) {
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate(result.route || "/products");
      }, 2000);
    }

    if (result.error) {
      // Handle field-specific errors from API
      if (result.error.fieldErrors) {
        const apiFieldErrors: FormErrors = {};
        Object.entries(result.error.fieldErrors).forEach(([key, value]) => {
          apiFieldErrors[key as keyof FormErrors] = value[0];
        });
        setFieldErrors(apiFieldErrors);
        setError(result.error.message);
      } else if (result.error.message) {
        setError(result.error.message);
      }
    }
  };

  const getPasswordStrengthScore = () => {
    let score = 0;
    if (passwordStrength.length) score++;
    if (passwordStrength.uppercase) score++;
    if (passwordStrength.lowercase) score++;
    if (passwordStrength.number) score++;
    if (passwordStrength.special) score++;
    return score;
  };

  const getPasswordStrengthText = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return { text: "Weak", color: "text-red-600" };
    if (score <= 3) return { text: "Fair", color: "text-yellow-600" };
    if (score <= 4) return { text: "Good", color: "text-blue-600" };
    return { text: "Strong", color: "text-green-600" };
  };

  const getPasswordStrengthColor = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return "bg-red-600";
    if (score <= 3) return "bg-yellow-600";
    if (score <= 4) return "bg-blue-600";
    return "bg-green-600";
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Join MarketTracker to start saving money
          </p>
        </div>

        {/* General Error Message */}
        {error && !fieldErrors.name && !fieldErrors.email && !fieldErrors.password && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-black transition-colors ${
                  fieldErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="John Doe"
                disabled={authLoading}
                autoComplete="name"
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-black transition-colors ${
                  fieldErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="you@example.com"
                disabled={authLoading}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:border-black transition-colors ${
                  fieldErrors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Create a strong password"
                disabled={authLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>

            {/* Field Error */}
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.password}
              </p>
            )}

            {/* Password Strength Indicator - Only show if no error */}
            {password && !fieldErrors.password && (
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Password Strength:</span>
                  <span className={`text-xs font-medium ${getPasswordStrengthText().color}`}>
                    {getPasswordStrengthText().text}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(getPasswordStrengthScore() / 5) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {passwordStrength.length ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={passwordStrength.length ? "text-green-600" : "text-gray-500"}>
                      Min. 6 chars
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordStrength.uppercase ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={passwordStrength.uppercase ? "text-green-600" : "text-gray-500"}>
                      Uppercase
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordStrength.lowercase ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={passwordStrength.lowercase ? "text-green-600" : "text-gray-500"}>
                      Lowercase
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {passwordStrength.number ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={passwordStrength.number ? "text-green-600" : "text-gray-500"}>
                      Number
                    </span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    {passwordStrength.special ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={passwordStrength.special ? "text-green-600" : "text-gray-500"}>
                      Special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                  if (error === "Passwords do not match") setError(null);
                }}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:border-black transition-colors ${
                  fieldErrors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Confirm your password"
                disabled={authLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              required
              className="mt-0.5 w-4 h-4 border-gray-300 rounded focus:ring-black"
            />
            <label className="text-sm text-gray-600">
              I agree to the{" "}
              <button type="button" className="text-black hover:underline">
                Terms of Service
              </button>{" "}
              and{" "}
              <button type="button" className="text-black hover:underline">
                Privacy Policy
              </button>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {authLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 text-white" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login", { state: { from } })}
              className="text-black font-semibold hover:underline transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">Why join us?</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Track prices across multiple markets
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Get notified when prices drop
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle className="w-3 h-3 text-green-600" />
              Save money on everyday goods
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}