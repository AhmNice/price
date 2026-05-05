// pages/AddMarket.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  MapPin,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  LocateFixed
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../store/api";

export default function AddMarket() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentMarkets, setRecentMarkets] = useState<any[]>([]);
  const [fetchingRecent, setFetchingRecent] = useState(false);

  useEffect(() => {
    fetchRecentMarkets();
  }, []);

  const fetchRecentMarkets = async () => {
    try {
      setFetchingRecent(true);
      const { data } = await api.get("/markets/list?limit=5");
      setRecentMarkets(data.data || []);
    } catch (error) {
      console.error("Failed to fetch recent markets", error);
    } finally {
      setFetchingRecent(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("Market name is required");
      return false;
    }

    if (name.trim().length < 2) {
      setError("Market name must be at least 2 characters");
      return false;
    }

    if (name.trim().length > 100) {
      setError("Market name must be less than 100 characters");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        name: name.trim(),
      };

      if (location.trim()) {
        payload.location = location.trim();
      }

      await api.post("/markets/create", payload);

      toast.success("Market created successfully!");

      // Reset form
      setName("");
      setLocation("");
      setError("");

      // Refresh recent markets
      await fetchRecentMarkets();

      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to create market";
      toast.error(errorMessage);
      setError(errorMessage);

      if (errorMessage.toLowerCase().includes("already exists")) {
        setError("A market with this name already exists");
      }
    } finally {
      setLoading(false);
    }
  };

  const suggestedMarkets = [
    "Mile 12 Market",
    "Computer Village",
    "Balogun Market",
    "Alaba International Market",
    "Oyingbo Market",
    "Idumota Market",
    "Tejuosho Market",
    "Ketu Market"
  ];

  const suggestedLocations = [
    "Lagos",
    "Abuja",
    "Port Harcourt",
    "Ibadan",
    "Kano",
    "Enugu",
    "Benin City",
    "Aba"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-black rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Add New Market</h1>
              <p className="text-gray-600 mt-1">
                Create a new market to start tracking prices
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Market Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-xl transition-colors
                    focus:outline-none focus:border-black
                    ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                  placeholder="e.g., Mile 12 Market"
                  disabled={loading}
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter the full market name as it's commonly known
              </p>
            </div>

            {/* Market Location Field (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
                  placeholder="e.g., Lagos, Nigeria"
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Add location to help users find markets near them
              </p>
            </div>

            {/* Suggested Markets */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Quick select market:
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedMarkets.map(market => (
                  <button
                    key={market}
                    type="button"
                    onClick={() => {
                      setName(market);
                      if (error) setError("");
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {market}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Locations */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Quick select location:
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedLocations.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Markets */}
            {recentMarkets.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Recently added markets:
                </label>
                <div className="space-y-1">
                  {recentMarkets.map(market => (
                    <div
                      key={market.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{market.name}</span>
                        {market.location && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {market.location}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setName(market.name);
                          setLocation(market.location || "");
                        }}
                        className="text-xs text-black hover:underline"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Market
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Why add markets?</p>
              <p>
                Markets are where prices are tracked. Adding accurate market information helps users find the best prices in their area. You can add price records for markets once they're created.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tip */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <LocateFixed className="w-4 h-4 text-gray-500" />
            <p className="text-xs text-gray-600">
              <span className="font-medium">Tip:</span> Include specific location details to help users identify the market easily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}