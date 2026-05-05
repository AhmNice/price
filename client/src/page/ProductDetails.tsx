// pages/ProductDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Award,
  ChevronRight,
  Share2,
  Heart,
  Loader2,
  Package,
  PlusCircle,
  XCircle,
  Target
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/AuthStore";
import toast from "react-hot-toast";
import api from "../store/api";

type Price = {
  marketName: string;
  price: number;
  location?: string;
  lastUpdated?: string;
  inStock?: boolean;
};

type ProductData = {
  id: string;
  name: string;
  category?: string;
  prices: Price[];
  averagePrice?: number;
  priceHistory?: Array<{ date: string; price: number }>;
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "market">("price");
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState<number | string>("");
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [checkingWatchlist, setCheckingWatchlist] = useState(true);

  const { user } = useAuthStore();

  useEffect(() => {
    fetchProductPrices();
    if (user?.id && id) {
      checkIfInWatchlist();
    }
  }, [id, user]);

  const fetchProductPrices = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/products/${id}/prices`
      );
      const result = await res.json();
      setData(result.data);
    } catch (error) {
      console.error("Failed to fetch prices", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfInWatchlist = async () => {
    try {
      setCheckingWatchlist(true);
      const { data } = await api.get(`/watchlist/check/${user?.id}/${id}`);
      setIsWatching(data.data?.isWatching || false);
    } catch (error) {
      console.error("Failed to check watchlist status", error);
    } finally {
      setCheckingWatchlist(false);
    }
  };

  const getLowestPrice = () => {
    if (!data?.prices?.length) return null;
    return Math.min(...data.prices.map((p) => p.price));
  };

  const getHighestPrice = () => {
    if (!data?.prices?.length) return null;
    return Math.max(...data.prices.map((p) => p.price));
  };

  const getPriceDifference = () => {
    const lowest = getLowestPrice();
    const highest = getHighestPrice();
    if (!lowest || !highest) return null;
    return highest - lowest;
  };

  const getSavingsPercentage = () => {
    const lowest = getLowestPrice();
    const highest = getHighestPrice();
    if (!lowest || !highest) return null;
    return Math.round(((highest - lowest) / highest) * 100);
  };

  const sortPrices = (prices: Price[]) => {
    return [...prices].sort((a, b) => {
      if (sortBy === "price") {
        return a.price - b.price;
      }
      return a.marketName.localeCompare(b.marketName);
    });
  };

  const lowestPrice = getLowestPrice();
  const priceDifference = getPriceDifference();
  const savingsPercentage = getSavingsPercentage();
  const hasPriceHistory = data?.prices && data.prices.length > 0;

  const handleAddToWatchlist = async () => {
    if (!user) {
      return navigate("/login", { state: { route: `/products/${id}` } });
    }

    // Show modal for target price input
    setShowWatchlistModal(true);
  };

  const handleConfirmAddToWatchlist = async () => {
    setAddingToWatchlist(true);
    try {
      const payload: any = {
        userId: user?.id,
        productId: id,
      };

      // Add target price only if provided
      if (targetPrice && Number(targetPrice) > 0) {
        payload.targetPrice = Number(targetPrice);
      }

      const { data } = await api.post("/watchlist/create", payload);

      if (data.success) {
        toast.success(
          targetPrice
            ? "Added to watchlist with price alert!"
            : "Added to watchlist!"
        );
        setIsWatching(true);
        setShowWatchlistModal(false);
        setTargetPrice("");
      } else {
        toast.error(data.message || "Failed to add to watchlist");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add to watchlist");
      console.error("Failed to add to watchlist", err);
    } finally {
      setAddingToWatchlist(false);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    if (!confirm("Are you sure you want to remove this product from your watchlist?")) {
      return;
    }

    try {
      await api.delete(`/watchlist/${user?.id}/${id}`);
      toast.success("Removed from watchlist");
      setIsWatching(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove from watchlist");
      console.error("Failed to remove from watchlist", err);
    }
  };

  const handleWatchlistClick = () => {
    if (isWatching) {
      handleRemoveFromWatchlist();
    } else {
      handleAddToWatchlist();
    }
  };

  const handleShare = () => {
    navigator.share?.({
      title: data?.name,
      text: `Check out ${data?.name} prices on MarketTracker`,
      url: window.location.href,
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    });
  };

  const handleAddPrice = () => {
    if (!user) {
      return navigate("/login", { state: { route: `/add-price?product=${id}` } });
    }
    navigate(`/add-price`, { state: { productId: id, productName: data?.name } });
  };

  const suggestedPrices = () => {
    if (lowestPrice) {
      return [
        Math.round(lowestPrice * 0.9),
        Math.round(lowestPrice * 0.95),
        Math.round(lowestPrice * 0.98),
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-black mb-4" />
            <p className="text-gray-600">Loading product details...</p>
          </div>
        )}

        {/* Product Details */}
        {!loading && data && (
          <>
            {/* Product Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {data.category && (
                    <span className="inline-block text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full mb-3">
                      {data.category}
                    </span>
                  )}
                  <h1 className="text-3xl lg:text-4xl font-bold text-black mb-3">
                    {data.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Store className="w-4 h-4" />
                      <span>{data.prices.length} markets</span>
                    </div>
                    {data.averagePrice && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Avg: ₦{data.averagePrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 border border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleWatchlistClick}
                    disabled={checkingWatchlist}
                    className={`p-2 border rounded-lg transition-all disabled:opacity-50 ${
                      isWatching
                        ? "bg-black border-black text-white"
                        : "border-gray-300 hover:border-black text-gray-600"
                    }`}
                    title={isWatching ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    {checkingWatchlist ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart className={`w-5 h-5 ${isWatching ? "fill-white" : ""}`} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Price Summary Cards - Only show if there are prices */}
            {hasPriceHistory ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {/* Best Price Card */}
                  <div className="bg-gray-900 text-white rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5" />
                      <span className="text-sm font-medium">Best Price</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      ₦{lowestPrice?.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-300">Lowest available price</p>
                  </div>

                  {/* Price Range Card */}
                  {priceDifference && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Price Range</span>
                      </div>
                      <div className="text-2xl font-bold text-black mb-1">
                        ₦{priceDifference.toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-500">
                        Difference between highest & lowest
                      </p>
                    </div>
                  )}

                  {/* Savings Card */}
                  {savingsPercentage && (
                    <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Potential Savings</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700 mb-1">
                        Up to {savingsPercentage}%
                      </div>
                      <p className="text-xs text-green-600">By choosing best price</p>
                    </div>
                  )}
                </div>

                {/* Sort Controls */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-black">Market Prices</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy("price")}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        sortBy === "price"
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Sort by Price
                    </button>
                    <button
                      onClick={() => setSortBy("market")}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        sortBy === "market"
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Sort by Market
                    </button>
                  </div>
                </div>

                {/* Price List */}
                <div className="space-y-3 mb-8">
                  {sortPrices(data.prices).map((item, index) => {
                    const isLowest = item.price === lowestPrice;
                    const isHighest = !isLowest && item.price === getHighestPrice();

                    return (
                      <div
                        key={index}
                        className={`
                          group relative overflow-hidden rounded-xl border transition-all duration-300
                          ${isLowest
                            ? "bg-gray-900 border-gray-900 text-white hover:shadow-xl"
                            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                          }
                        `}
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Store className={`w-5 h-5 ${isLowest ? "text-gray-300" : "text-gray-400"}`} />
                                <h3 className={`font-semibold ${isLowest ? "text-white" : "text-gray-900"}`}>
                                  {item.marketName}
                                </h3>
                                {isLowest && (
                                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Award className="w-3 h-3" />
                                    Best Price
                                  </span>
                                )}
                                {isHighest && !isLowest && (
                                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                    Highest
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                {item.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className={`w-3 h-3 ${isLowest ? "text-gray-300" : "text-gray-400"}`} />
                                    <span className={isLowest ? "text-gray-300" : "text-gray-500"}>
                                      {item.location}
                                    </span>
                                  </div>
                                )}
                                {item.lastUpdated && (
                                  <div className="flex items-center gap-1">
                                    <Clock className={`w-3 h-3 ${isLowest ? "text-gray-300" : "text-gray-400"}`} />
                                    <span className={isLowest ? "text-gray-300" : "text-gray-500"}>
                                      Updated: {item.lastUpdated}
                                    </span>
                                  </div>
                                )}
                                {item.inStock !== undefined && (
                                  <div className="flex items-center gap-1">
                                    {item.inStock ? (
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <AlertCircle className="w-3 h-3 text-red-500" />
                                    )}
                                    <span className={item.inStock ? "text-green-600" : "text-red-600"}>
                                      {item.inStock ? "In Stock" : "Low Stock"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className={`text-2xl font-bold ${isLowest ? "text-white" : "text-black"}`}>
                                ₦{item.price.toLocaleString()}
                              </div>
                              {data.averagePrice && (
                                <div className={`text-xs ${isLowest ? "text-gray-300" : "text-gray-500"}`}>
                                  {item.price < data.averagePrice ? "Below avg" :
                                   item.price > data.averagePrice ? "Above avg" : "At avg"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Hover effect line */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* No Price History State */
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200 mb-8">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Price History Available
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  There are currently no price records for {data.name}.
                  {user && user.role === "admin" && (' Be the first to add a price and help others save money!')}
                </p>
                {user && user.role === "admin" && (
                  <button
                    onClick={handleAddPrice}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all hover:scale-105"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Add First Price
                  </button>
                )}
              </div>
            )}

            {/* Watchlist Modal */}
            {showWatchlistModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Bell className="w-6 h-6 text-black" />
                        <h2 className="text-2xl font-bold text-black">Add to Watchlist</h2>
                      </div>
                      <button
                        onClick={() => {
                          setShowWatchlistModal(false);
                          setTargetPrice("");
                        }}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <XCircle className="w-6 h-6 text-gray-500" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600 mb-2">
                          Get notified when <span className="font-semibold text-black">{data?.name}</span> drops to your desired price.
                        </p>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                          <p className="text-sm text-blue-800">
                            💡 Tip: Setting a target price will alert you when the price drops below that amount.
                          </p>
                        </div>
                      </div>

                      {/* Target Price Input (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Price (Optional)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={targetPrice}
                            onChange={(e) => {
                              const value = e.target.value;
                              setTargetPrice(value ? Math.round(Number(value)) : 0)
                            }}
                            placeholder="Enter target price (e.g., 40000)"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            min="0"
                            step="100"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Leave empty to just save to watchlist without price alert
                        </p>
                      </div>

                      {/* Suggested Prices */}
                      {suggestedPrices().length > 0 && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Suggested prices based on current market:
                          </label>
                          <div className="flex gap-2">
                            {suggestedPrices().map((price, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setTargetPrice(price.toString())}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                ₦{price.toLocaleString()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => {
                            setShowWatchlistModal(false);
                            setTargetPrice("");
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirmAddToWatchlist}
                          disabled={addingToWatchlist}
                          className="flex-1 bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {addingToWatchlist ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Heart className="w-4 h-4" />
                              Add to Watchlist
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Login Prompt for Watchlist */}
            {!user && hasPriceHistory && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Sign in to get notified when prices drop
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/login", { state: { route: `/products/${id}` } })}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Error State */}
        {!loading && !data && (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h3>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}