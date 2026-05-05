// pages/Products.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Package,
  ArrowLeft,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Eye,
  Loader2,
  Plus
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/AuthStore";

type Product = {
  id: string;
  name: string;
  category?: string;
  currentPrice?: number;
  averagePrice?: number;
  priceTrend?: 'up' | 'down' | 'stable';
  marketCount?: number;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const {user} = useAuthStore()

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products/list");
      const data = await res.json();
      setProducts(data.data);
      setFilteredProducts(data.data);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.data.map((p: Product) => p.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const getTrendIcon = (trend?: string) => {
    switch(trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-600" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriceChangeColor = (trend?: string) => {
    switch(trend) {
      case 'up': return "text-red-600";
      case 'down': return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

        {
          user && user?.role === "admin" && (
            <button
              onClick={() => navigate("/add-product")}
              className="inline-flex items-center gap-2 bg-black text-white hover:bg-gray-800 transition-colors py-2 px-4 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )
        }


        </div>
  <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">
                Market Products
              </h1>
              <p className="text-gray-600">
                Browse and compare prices across {products.length}+ products
              </p>
            </div>
            <div className="hidden lg:block text-right">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors bg-white"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors bg-white cursor-pointer min-w-[160px]"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-500">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin h-12 w-12 mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No products available at the moment"}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="group bg-white border border-gray-200 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Product Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-black transition-colors">
                        {product.name}
                      </h2>
                      {product.category && (
                        <span className="inline-block mt-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      )}
                    </div>
                    <Package className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                  </div>

                  {/* Price Information */}
                  <div className="mt-4 space-y-2">
                    {product.currentPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Price:</span>
                        <span className="font-bold text-lg text-black">
                          ₦{product.currentPrice.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {product.averagePrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Market Average:</span>
                        <span className="text-sm text-gray-700">
                          ₦{product.averagePrice.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {product.priceTrend && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price Trend:</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(product.priceTrend)}
                          <span className={`text-sm font-medium ${getPriceChangeColor(product.priceTrend)}`}>
                            {product.priceTrend === 'up' ? 'Increasing' :
                             product.priceTrend === 'down' ? 'Decreasing' : 'Stable'}
                          </span>
                        </div>
                      </div>
                    )}

                    {product.marketCount && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Available at:</span>
                        <span className="text-sm text-gray-700">
                          {product.marketCount} markets
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View Details Link */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 group-hover:text-black transition-colors flex items-center gap-1">
                        View details
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <Eye className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error handling note */}
        {!loading && products.length === 0 && !filteredProducts.length && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Unable to load products</p>
                <p>Please check your connection and try again later.</p>
                <button
                  onClick={fetchProducts}
                  className="mt-2 text-black hover:underline font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}