// pages/AddPrice.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Store,
  DollarSign,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  TrendingUp
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../store/api";

type Product = {
  id: string;
  name: string;
  category?: string;
};

type Market = {
  id: string;
  name: string;
  location?: string;
};

export default function AddPrice() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [productId, setProductId] = useState("");
  const [marketId, setMarketId] = useState("");
  const [price, setPrice] = useState("");

  const [errors, setErrors] = useState<{
    productId?: string;
    marketId?: string;
    price?: string;
  }>({});

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [recentPrice, setRecentPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Find selected product object when productId changes
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
  }, [productId, products]);

  useEffect(() => {
    // Find selected market object when marketId changes
    const market = markets.find(m => m.id === marketId);
    setSelectedMarket(market || null);
  }, [marketId, markets]);

  const fetchData = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        api.get("/products/list"),
        api.get("/markets/list"),
      ]);


      setProducts(pRes.data.data || []);
      setMarkets(mRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load products and markets");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchRecentPrice = async (productId: string, marketId: string) => {
    try {
      const response = await api.get(`/prices/recent`, {
        params: { productId, marketId }
      });
      if (response.data.data?.price) {
        setRecentPrice(response.data.data.price);
      } else {
        setRecentPrice(null);
      }
    } catch (error) {
      setRecentPrice(null);
    }
  };

  const handleProductChange = (id: string) => {
    setProductId(id);
    setErrors({ ...errors, productId: undefined });
    if (id && marketId) {
      fetchRecentPrice(id, marketId);
    } else {
      setRecentPrice(null);
    }
  };

  const handleMarketChange = (id: string) => {
    setMarketId(id);
    setErrors({ ...errors, marketId: undefined });
    if (productId && id) {
      fetchRecentPrice(productId, id);
    } else {
      setRecentPrice(null);
    }
  };

  const validateForm = () => {
    const newErrors: { productId?: string; marketId?: string; price?: string } = {};

    if (!productId) {
      newErrors.productId = "Please select a product";
    }

    if (!marketId) {
      newErrors.marketId = "Please select a market";
    }

    if (!price) {
      newErrors.price = "Please enter a price";
    } else if (isNaN(Number(price))) {
      newErrors.price = "Price must be a number";
    } else if (Number(price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    } else if (Number(price) > 999999999) {
      newErrors.price = "Price is too high";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await api.post("/prices/create", {
        productId,
        marketId,
        price: Number(price),
      });

      toast.success("Price added successfully!");

      // Reset form
      setPrice("");
      setProductId("");
      setMarketId("");
      setSelectedProduct(null);
      setSelectedMarket(null);
      setRecentPrice(null);
      setErrors({});

    
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to add price";
      toast.error(errorMessage);

      if (errorMessage.toLowerCase().includes("duplicate")) {
        setErrors({ price: "A price record for this product and market already exists for today" });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPriceSuggestion = () => {
    if (recentPrice) {
      const difference = Number(price) - recentPrice;
      if (difference && Math.abs(difference) > 0) {
        return {
          text: difference > 0 ? `+₦${difference.toLocaleString()} from last price` : `-₦${Math.abs(difference).toLocaleString()} from last price`,
          color: difference > 0 ? "text-red-600" : "text-green-600"
        };
      }
    }
    return null;
  };

  const priceSuggestion = getPriceSuggestion();

  if (loadingData) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="animate-spin  h-12 w-12 mb-4"/>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-black rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Add Price Record</h1>
              <p className="text-gray-600 mt-1">
                Record current market prices for products
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-xl appearance-none cursor-pointer
                    focus:outline-none focus:border-black bg-white
                    ${errors.productId ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.category ? `(${product.category})` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {errors.productId && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.productId}
                </p>
              )}
              {selectedProduct && (
                <p className="mt-1 text-xs text-gray-500">
                  Tracking prices for: <span className="font-medium">{selectedProduct.name}</span>
                </p>
              )}
            </div>

            {/* Market Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={marketId}
                  onChange={(e) => handleMarketChange(e.target.value)}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-xl appearance-none cursor-pointer
                    focus:outline-none focus:border-black bg-white
                    ${errors.marketId ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                >
                  <option value="">Select a market</option>
                  {markets.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.name} {market.location ? `- ${market.location}` : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {errors.marketId && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.marketId}
                </p>
              )}
              {selectedMarket && (
                <p className="mt-1 text-xs text-gray-500">
                  Location: {selectedMarket.location || "Not specified"}
                </p>
              )}
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors({ ...errors, price: undefined });
                  }}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-xl transition-colors
                    focus:outline-none focus:border-black
                    ${errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                  placeholder="e.g., 45000"
                  disabled={loading}
                  step="100"
                  min="0"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.price}
                </p>
              )}

              {/* Recent Price Comparison */}
              {recentPrice && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Last recorded price:</span>
                    <span className="font-medium text-gray-900">
                      ₦{recentPrice.toLocaleString()}
                    </span>
                  </div>
                  {price && Number(price) > 0 && priceSuggestion && (
                    <div className={`flex items-center justify-between text-xs mt-1 ${priceSuggestion.color}`}>
                      <span>Change:</span>
                      <span className="font-medium">{priceSuggestion.text}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="mt-1 text-xs text-gray-500">
                Enter the current selling price for this product at the selected market
              </p>
            </div>

            {/* Preview Section */}
            {productId && marketId && price && !errors.productId && !errors.marketId && !errors.price && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Price Record Preview
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium text-gray-900">{selectedProduct?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market:</span>
                    <span className="font-medium text-gray-900">{selectedMarket?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-black text-lg">₦{Number(price).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/products")}
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
                    Adding Price...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Price
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-gray-700 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Why record prices?</p>
              <p>
                Regular price updates help build accurate price history and trends.
                This data helps users make informed purchasing decisions and set up effective price alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {products.length > 0 && markets.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Available Products</p>
              <p className="text-lg font-bold text-black">{products.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-xs text-gray-500">Available Markets</p>
              <p className="text-lg font-bold text-black">{markets.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for chevron down icon
const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);