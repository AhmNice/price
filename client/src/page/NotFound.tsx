// pages/NotFound.tsx
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import Navbar from "../components/Navbar";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-100 rounded-full mb-6">
              <span className="text-6xl font-bold text-gray-400">404</span>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl font-bold text-black mb-4">
            Page Not Found
          </h1>

          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>

            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Search className="w-5 h-5" />
              Browse Products
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-12 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600">
              Need help?{" "}
              <button
                onClick={() => navigate("/products")}
                className="text-black font-medium hover:underline"
              >
                Browse our products
              </button>{" "}
              or{" "}
              <button
                onClick={() => navigate("/")}
                className="text-black font-medium hover:underline"
              >
                return to homepage
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}