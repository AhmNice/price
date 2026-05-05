// pages/AddProduct.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Tag,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../store/api";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { name?: string; category?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Product name is required";
    } else if (name.length < 2) {
      newErrors.name = "Product name must be at least 2 characters";
    } else if (name.length > 100) {
      newErrors.name = "Product name must be less than 100 characters";
    }

    if (!category.trim()) {
      newErrors.category = "Category is required";
    } else if (category.length < 2) {
      newErrors.category = "Category must be at least 2 characters";
    } else if (category.length > 50) {
      newErrors.category = "Category must be less than 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await api.post("/products/create", {
        name: name.trim(),
        category: category.trim(),
      });

      toast.success("Product created successfully!");

      // Reset form
      setName("");
      setCategory("");
      setErrors({});

    
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to create product";
      toast.error(errorMessage);

      // Handle duplicate product error
      if (errorMessage.toLowerCase().includes("already exists")) {
        setErrors({ name: "A product with this name already exists" });
      }
    } finally {
      setLoading(false);
    }
  };

  const suggestedCategories = [
    "Food Staples",
    "Vegetables",
    "Fruits",
    "Dairy",
    "Meat",
    "Beverages",
    "Household",
    "Electronics",
    "Clothing",
    "Other"
  ];

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
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Add New Product</h1>
              <p className="text-gray-600 mt-1">
                Create a new product to start tracking prices
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Product Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-xl transition-colors
                    focus:outline-none focus:border-black
                    ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                  placeholder="e.g., Basmati Rice (5kg)"
                  disabled={loading}
                  autoFocus
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter the full product name as it appears in markets
              </p>
            </div>

            {/* Category Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (errors.category) setErrors({ ...errors, category: undefined });
                  }}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-xl transition-colors
                    focus:outline-none focus:border-black
                    ${errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  `}
                  placeholder="e.g., Food Staples"
                  disabled={loading}
                  list="suggested-categories"
                />
                <datalist id="suggested-categories">
                  {suggestedCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.category}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Choose a category to help organize products
              </p>
            </div>

            {/* Suggested Categories Quick Select */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Quick select category:
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedCategories.slice(0, 6).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      if (errors.category) setErrors({ ...errors, category: undefined });
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

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
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Product
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
              <p className="font-medium mb-1">Product Information</p>
              <p>
                Once created, you can start tracking prices for this product across different markets.
                You'll be able to add price records and set up price alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Tips:</h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Use specific product names for better tracking (e.g., "Premium Basmati Rice 5kg")</li>
            <li>• Categories help organize products and filter searches</li>
            <li>• You can always edit product details later</li>
          </ul>
        </div>
      </div>
    </div>
  );
}