// pages/MarketDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  MapPin,
  Package,
  DollarSign,
  Loader2,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  PlusCircle,
  Calendar
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../store/api";
import { useAuthStore } from "../store/AuthStore";

type PriceItem = {
  productId: string;
  productName: string;
  price: number;
  recordedAt?: string;
  category?: string;
};

type Market = {
  id: string;
  name: string;
  location?: string;
  createdAt?: string;
  prices: PriceItem[];
  totalProducts?: number;
  averagePrice?: number;
};

export default function MarketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"price" | "name">("name");
  const {user} = useAuthStore()
  useEffect(() => {
    fetchMarketPrices();
  }, [id]);

  const fetchMarketPrices = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/markets/${id}/prices`);
      const data = res.data.data;

      // Calculate additional stats
      const prices = data.prices || [];
      const totalProducts = prices.length;
      const averagePrice = prices.length > 0
        ? Math.round(prices.reduce((sum: number, p: PriceItem) => sum + p.price, 0) / prices.length)
        : undefined;

      setMarket({
        ...data,
        totalProducts,
        averagePrice,
      });
    } catch (err: any) {
      console.error("Failed to fetch market prices", err);
      toast.error(err.response?.data?.message || "Failed to load market details");
    } finally {
      setLoading(false);
    }
  };

  const sortPrices = (prices: PriceItem[]) => {
    return [...prices].sort((a, b) => {
      if (sortBy === "price") {
        return a.price - b.price;
      }
      return a.productName.localeCompare(b.productName);
    });
  };

  const getPriceChangeIndicator = (price: number, index: number, prices: PriceItem[]) => {
    if (index === 0) return null;
    const prevPrice = prices[index - 1].price;
    if (price > prevPrice) {
      return <TrendingUp className="w-4 h-4 text-red-600" />;
    } else if (price < prevPrice) {
      return <TrendingDown className="w-4 h-4 text-green-600" />;
    }
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getHighestPrice = () => {
    if (!market?.prices.length) return null;
    return Math.max(...market.prices.map(p => p.price));
  };

  const getLowestPrice = () => {
    if (!market?.prices.length) return null;
    return Math.min(...market.prices.map(p => p.price));
  };

  const highestPrice = getHighestPrice();
  const lowestPrice = getLowestPrice();
  const sortedPrices = market ? sortPrices(market.prices) : [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/markets")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Markets
        </button>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-black mb-4" />
            <p className="text-gray-600">Loading market details...</p>
          </div>
        )}

        {/* Market Details */}
        {!loading && market && (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="w-6 h-6 text-gray-700" />
                    <h1 className="text-3xl lg:text-4xl font-bold text-black">
                      {market.name}
                    </h1>
                  </div>
                  {market.location && (
                    <div className="flex items-center gap-1 text-gray-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{market.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{market.totalProducts || 0} products</span>
                    </div>
                    {market.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Added: {new Date(market.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Price Button */}
               {user && user.role === "admin" && (
                 <button
                  onClick={() => navigate("/add-price", { state: { marketId: market.id, marketName: market.name } })}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add Price
                </button>
               )}
              </div>
            </div>

            {/* Price Summary Cards */}
            {market.prices.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Average Price */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Average Price</span>
                  </div>
                  <div className="text-2xl font-bold text-black">
                    ₦{market.averagePrice?.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">Across all products</p>
                </div>

                {/* Price Range */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Price Range</span>
                  </div>
                  <div className="text-2xl font-bold text-black">
                    ₦{lowestPrice?.toLocaleString()} - ₦{highestPrice?.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">Lowest to highest</p>
                </div>

                {/* Total Products */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">Products Tracked</span>
                  </div>
                  <div className="text-2xl font-bold text-black">
                    {market.totalProducts}
                  </div>
                  <p className="text-xs text-gray-500">With price records</p>
                </div>
              </div>
            )}

            {/* Sort Controls */}
            {market.prices.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-black">Product Prices</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy("name")}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      sortBy === "name"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Sort by Name
                  </button>
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
                </div>
              </div>
            )}

            {/* Price List */}
            {market.prices.length > 0 ? (
              <div className="space-y-3 mb-8">
                {sortedPrices.map((item, index) => {
                  const isHighest = item.price === highestPrice;
                  const isLowest = item.price === lowestPrice && !isHighest;

                  return (
                    <div
                      key={item.productId || index}
                      className={`
                        group relative overflow-hidden rounded-xl border transition-all duration-300
                        ${isLowest
                          ? "bg-gray-900 border-gray-900 text-white"
                          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                        }
                      `}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className={`w-5 h-5 ${isLowest ? "text-gray-300" : "text-gray-400"}`} />
                              <h3 className={`font-semibold ${isLowest ? "text-white" : "text-gray-900"}`}>
                                {item.productName}
                              </h3>
                              {isLowest && (
                                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  Best Price
                                </span>
                              )}
                              {isHighest && !isLowest && (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                  Highest
                                </span>
                              )}
                            </div>
                            {item.category && (
                              <p className={`text-xs ${isLowest ? "text-gray-300" : "text-gray-500"} ml-7`}>
                                {item.category}
                              </p>
                            )}
                            {item.recordedAt && (
                              <div className="flex items-center gap-1 mt-2 ml-7">
                                <Clock className={`w-3 h-3 ${isLowest ? "text-gray-300" : "text-gray-400"}`} />
                                <span className={`text-xs ${isLowest ? "text-gray-300" : "text-gray-500"}`}>
                                  Last updated: {new Date(item.recordedAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${isLowest ? "text-white" : "text-black"}`}>
                              ₦{item.price.toLocaleString()}
                            </div>
                            {index > 0 && (
                              <div className="flex items-center justify-end gap-1 mt-1">
                                {getPriceChangeIndicator(item.price, index, sortedPrices)}
                                <span className={`text-xs ${isLowest ? "text-gray-300" : "text-gray-500"}`}>
                                  vs previous
                                </span>
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
            ) : (
              /* No Prices State */
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Prices Available
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  There are currently no price records for {market.name}.
                  Add the first price to start tracking!
                </p>
                <button
                  onClick={() => navigate("/add-price", { state: { marketId: market.id, marketName: market.name } })}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all hover:scale-105"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add First Price
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/add-price", { state: { marketId: market.id, marketName: market.name } })}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Add Another Price
              </button>
              <button
                onClick={() => navigate("/products")}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                Browse Products
              </button>
            </div>
          </>
        )}

        {/* Error State */}
        {!loading && !market && (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Market not found</h3>
            <p className="text-gray-600 mb-6">
              The market you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/markets")}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Markets
            </button>
          </div>
        )}
      </div>
    </div>
  );
}