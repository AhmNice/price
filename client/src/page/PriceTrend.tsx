// pages/PriceTrend.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  DollarSign,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  LineChart as LineChartIcon,
  Info,
  Search,
  Package,
  ChevronRight,
  XCircle,
  Loader2,
  Plus
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/AuthStore";

type Product = {
  id: string;
  name: string;
  category: string;
};

type PriceRecord = {
  price: number;
  recordedAt: string;
  marketName?: string;
  marketLocation?: string;
};

type TrendData = {
  name: string;
  history: PriceRecord[];
  averagePrice?: number;
  currentPrice?: number;
  priceChange?: number;
  priceChangePercentage?: number;
};

export default function PriceTrend() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllData, setShowAllData] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "simple">("simple");
  const [showProductSelector, setShowProductSelector] = useState(true);
  const {user} = useAuthStore();
  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products/list");
      const result = await res.json();
      setProducts(result.data || []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const fetchPriceHistory = async (productId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/prices/product/${productId}/history`);
      const result = await res.json();
      const historyData = result.data || [];

      setData({
        name: selectedProduct?.name || result.data[0]?.product?.name || "Unknown Product",
        history: historyData,
        averagePrice: calculateAverage(historyData),
        currentPrice: historyData[historyData.length - 1]?.price,
        priceChange: calculatePriceChange(historyData),
        priceChangePercentage: calculatePriceChangePercentage(historyData),
      });
    } catch (error) {
      console.error("Failed to fetch price history", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowProductSelector(false);
    fetchPriceHistory(product.id);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setData(null);
    setShowProductSelector(true);
    setSearchTerm("");
  };

  const calculateAverage = (historyData: PriceRecord[]) => {
    if (!historyData.length) return undefined;
    const sum = historyData.reduce((acc, curr) => acc + curr.price, 0);
    return Math.round(sum / historyData.length);
  };

  const calculatePriceChange = (historyData: PriceRecord[]) => {
    if (historyData.length < 2) return undefined;
    const first = historyData[0].price;
    const last = historyData[historyData.length - 1].price;
    return last - first;
  };

  const calculatePriceChangePercentage = (historyData: PriceRecord[]) => {
    if (historyData.length < 2) return undefined;
    const first = historyData[0].price;
    const last = historyData[historyData.length - 1].price;
    return ((last - first) / first) * 100;
  };

  const getTrendIcon = (currentPrice?: number, previousPrice?: number) => {
    if (!currentPrice || !previousPrice) return <Minus className="w-4 h-4" />;
    if (currentPrice > previousPrice) return <TrendingUp className="w-4 h-4 text-red-600" />;
    if (currentPrice < previousPrice) return <TrendingDown className="w-4 h-4 text-green-600" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getPriceChangeColor = (change?: number) => {
    if (!change) return "text-gray-600";
    if (change > 0) return "text-red-600";
    if (change < 0) return "text-green-600";
    return "text-gray-600";
  };

  const getPriceChangeSymbol = (change?: number) => {
    if (!change) return "";
    return change > 0 ? "+" : "";
  };

  const getMinPrice = () => {
    if (!data?.history.length) return null;
    return Math.min(...data.history.map(h => h.price));
  };

  const getMaxPrice = () => {
    if (!data?.history.length) return null;
    return Math.max(...data.history.map(h => h.price));
  };

  const getPriceRange = () => {
    const min = getMinPrice();
    const max = getMaxPrice();
    if (!min || !max) return null;
    return max - min;
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayHistory = showAllData ? data?.history || [] : data?.history.slice(-10) || [];
  const maxPrice = getMaxPrice() || 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
             <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

          <button
          onClick={() => {
            if (selectedProduct) {
              handleBackToProducts();
            } else {
              navigate("/products");
            }
          }}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {selectedProduct ? "Back to Product Selection" : "Back to Products"}
        </button>

         {
          user && user?.role === "admin" && (
            <button
              onClick={() => navigate("/add-price")}
              className="inline-flex items-center gap-2 bg-black text-white hover:bg-gray-800 transition-colors py-2 px-4 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Price
            </button>
          )
        }
      </div>

        {/* Product Selector */}
        {showProductSelector && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-black mb-3">
                Price Trends
              </h1>
              <p className="text-gray-600">
                Select a product to view its historical price data and trends
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <XCircle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="group w-full text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                          <h3 className="font-semibold text-gray-900 group-hover:text-black">
                            {product.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 ml-7">
                          {product.category}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">
                  {searchTerm ? "Try a different search term" : "No products available"}
                </p>
              </div>
            )}

            {/* Quick Stats */}
            {products.length > 0 && (
              <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Products Available</span>
                  <span className="font-semibold text-black">{products.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-semibold text-black">
                    {new Set(products.map(p => p.category)).size}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin  h-12 w-12  mb-4"/>
            <p className="text-gray-600">Loading price trends for {selectedProduct?.name}...</p>
          </div>
        )}

        {/* Price Trend Content */}
        {!loading && data && !showProductSelector && (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">
                    {data.name || 'mmmmm'}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Activity className="w-4 h-4" />
                    <span>Price History & Trends</span>
                  </div>
                </div>
                <button
                  onClick={handleBackToProducts}
                  className="text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Change Product
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Current Price */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Current Price</span>
                </div>
                <div className="text-2xl font-bold text-black">
                  ₦{data.currentPrice?.toLocaleString()}
                </div>
                {data.priceChange !== undefined && (
                  <div className={`flex items-center gap-1 mt-1 text-sm ${getPriceChangeColor(data.priceChange)}`}>
                    {getTrendIcon(data.currentPrice, data.history[data.history.length - 2]?.price)}
                    <span>
                      {getPriceChangeSymbol(data.priceChange)}₦{Math.abs(data.priceChange).toLocaleString()}
                    </span>
                    <span>
                      ({getPriceChangeSymbol(data.priceChangePercentage)}{data.priceChangePercentage?.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Average Price */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Average Price</span>
                </div>
                <div className="text-2xl font-bold text-black">
                  ₦{data.averagePrice?.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Over {data.history.length} records
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <LineChartIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Price Range</span>
                </div>
                <div className="text-2xl font-bold text-black">
                  ₦{getPriceRange()?.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Min: ₦{getMinPrice()?.toLocaleString()} | Max: ₦{getMaxPrice()?.toLocaleString()}
                </div>
              </div>

              {/* Total Records */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Recorded Changes</span>
                </div>
                <div className="text-2xl font-bold text-black">
                  {data.history.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Price updates tracked
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("simple")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === "simple"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Simple View
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  List View
                </button>
              </div>

              {data.history.length > 10 && (
                <button
                  onClick={() => setShowAllData(!showAllData)}
                  className="text-sm text-gray-600 hover:text-black transition-colors flex items-center gap-1"
                >
                  {showAllData ? (
                    <>Show Recent <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show All History <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>

            {/* Simple View - Chart */}
            {viewMode === "simple" && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <LineChartIcon className="w-4 h-4" />
                  Price Trend Visualization
                </h3>
                <div className="space-y-3 font-mono text-sm">
                  {displayHistory.map((item, index) => {
                    const isIncrease = index > 0 && item.price > displayHistory[index - 1].price;
                    const isDecrease = index > 0 && item.price < displayHistory[index - 1].price;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-32 text-gray-500">
                          {new Date(item.recordedAt).toLocaleDateString()}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="bg-black text-white px-2 py-0.5 rounded text-xs">
                            ₦{item.price.toLocaleString()}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-black h-full rounded-full transition-all duration-500"
                              style={{ width: `${(item.price / maxPrice) * 100}%` }}
                            />
                          </div>
                          {index > 0 && (
                            <div className="w-16 text-right">
                              {isIncrease && <TrendingUp className="w-4 h-4 text-red-600 inline" />}
                              {isDecrease && <TrendingDown className="w-4 h-4 text-green-600 inline" />}
                              {!isIncrease && !isDecrease && <Minus className="w-4 h-4 text-gray-500 inline" />}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Date</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Market</th>
                        <th className="text-right p-4 text-sm font-semibold text-gray-600">Price</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-600">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayHistory.map((item, index) => {
                        const prev = displayHistory[index - 1];
                        const priceChange = prev ? item.price - prev.price : undefined;
                        const isDrop = priceChange && priceChange < 0;
                        const isIncrease = priceChange && priceChange > 0;

                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-gray-700 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {new Date(item.recordedAt).toLocaleString()}
                              </div>
                            </td>
                            <td className="p-4 text-gray-600">
                              {item.marketName || "Multiple Markets"}
                            </td>
                            <td className="p-4 text-right">
                              <span className="font-semibold text-black">
                                ₦{item.price.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-4">
                              {priceChange !== undefined && (
                                <span className={isDrop ? "text-green-600" : isIncrease ? "text-red-600" : "text-gray-500"}>
                                  {isDrop ? "↓" : isIncrease ? "↑" : "→"}
                                  {' '}₦{Math.abs(priceChange).toLocaleString()}
                                </span>
                              )}
                              {priceChange === undefined && (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">About Price Trends</p>
                  <p>
                    This data shows historical price changes for {data.name}.
                    Prices are updated regularly based on market reports.
                    {data.priceChange && data.priceChange < 0 && " The current trend shows decreasing prices, which might be a good time to buy."}
                    {data.priceChange && data.priceChange > 0 && " The current trend shows increasing prices. Consider buying soon."}
                    {data.priceChange === 0 && " Prices have remained stable over the tracked period."}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Error State */}
        {!loading && !data && !showProductSelector && (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No price history found</h3>
            <p className="text-gray-600 mb-6">
              Price data for this product is not available at the moment.
            </p>
            <button
              onClick={handleBackToProducts}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Select Another Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}