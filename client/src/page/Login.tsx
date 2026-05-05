// pages/Login.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  Loader2
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuthStore, type AuthError } from "../store/AuthStore";
;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading: authLoading, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const from = (location.state as any)?.from?.pathname || (location.state as any)?.route || "/products";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const getFieldError = (fieldName: string): string | undefined => {
    if (!error?.fieldErrors) return undefined;
    const fieldErrors = error.fieldErrors[fieldName];
    return fieldErrors?.[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError({ message: "Please fill in all fields", field: "email" });
      return;
    }

    if (!email.includes("@")) {
      setError({ message: "Please enter a valid email address", field: "email" });
      return;
    }

    const result = await login({ email, password });

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem("savedEmail", email);
      } else {
        localStorage.removeItem("savedEmail");
      }
      return navigate(from, { replace: true });
    }

    if (result.error) {
      setError(result.error);
    }
  };

  const emailError = getFieldError("email");
  const passwordError = getFieldError("password");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* General Error Message */}
        {error && !error.fieldErrors && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error.message}</p>
              {error.field && (
                <p className="text-xs text-red-600 mt-1">
                  Please check the {error.field} field
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-black transition-colors ${
                  emailError ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="you@example.com"
                disabled={authLoading}
                autoComplete="email"
              />
            </div>
            {emailError && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {emailError}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:border-black transition-colors ${
                  passwordError ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Enter your password"
                disabled={authLoading}
                autoComplete="current-password"
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
            {passwordError && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {passwordError}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border-gray-300 rounded focus:ring-black"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {authLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 text-white" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register", { state: { from } })}
              className="text-black font-semibold hover:underline transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 text-center mb-2">
            Demo Credentials
          </p>
          <div className="space-y-1 text-xs text-gray-500 text-center">
            <p>Email: demo@example.com</p>
            <p>Password: demo123</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail("demo@example.com");
              setPassword("demo123");
              setError(null);
            }}
            className="mt-2 w-full text-xs text-black hover:underline"
          >
            Fill demo credentials
          </button>
        </div>
      </div>
    </div>
  );
}