// pages/Alerts.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Package,
  ChevronRight,
  XCircle,
  Loader2,
  Eye,
  Target
} from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import api from "../store/api";
import { useAuthStore } from "../store/AuthStore";

type WatchlistItem = {
  id: string;
  userId: string;
  productId: string;
  targetPrice: number | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    category: string;
    createdAt: string;
  };
  currentPrice?: number;
  lowestPrice?: number;
};

export default function Alerts() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [newAlert, setNewAlert] = useState({
    productId: "",
    productName: "",
    targetPrice: "",
  });
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuthStore();
  useEffect(() => {
    if(!user){
      navigate("/login", {state: { route: "/alerts" }});
    }
  }, [user]);
  useEffect(() => {
    if (user?.id) {
      fetchWatchlist();
      fetchProducts();
    }
  }, [user]);


  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/watchlist/list/${user?.id}`);

      // Fetch current prices for each product in watchlist
      const watchlistWithPrices = await Promise.all(
        (data.data || []).map(async (item: WatchlistItem) => {
          try {
            const pricesRes = await api.get(`/products/${item.productId}/prices`);
            const prices = pricesRes.data.data?.prices || [];
            const lowestPrice = prices.length > 0
              ? Math.min(...prices.map((p: any) => p.price))
              : null;
            const currentPrice = prices.length > 0 ? prices[0]?.price : null;

            return {
              ...item,
              lowestPrice,
              currentPrice,
            };
          } catch (error) {
            return item;
          }
        })
      );

      setWatchlist(watchlistWithPrices);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch watchlist");
      console.error("Failed to fetch watchlist", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products/list");
      setProducts(data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch products");
      console.error("Failed to fetch products", err);
    }
  };

  const addToWatchlist = async (productId: string, targetPrice?: number) => {
    try {
      const payload: any = {
        userId: user?.id,
        productId,
      };

      if (targetPrice && targetPrice > 0) {
        payload.targetPrice = targetPrice;
      }

      const { data } = await api.post("/watchlist/create", payload);

      if (data.success) {
        toast.success(
          targetPrice
            ? "Added to watchlist with price alert!"
            : "Added to watchlist!"
        );
        fetchWatchlist();
        return true;
      } else {
        toast.error(data.message || "Failed to add to watchlist");
        return false;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add to watchlist");
      console.error("Failed to add to watchlist", err);
      return false;
    }
  };

  const updateTargetPrice = async (id: string, targetPrice: number | null) => {
    try {
      const { data } = await api.put(`/watchlist/${id}`, {
        targetPrice,
      });

      if (data.success) {
        toast.success(targetPrice ? "Price alert updated!" : "Price alert removed");
        fetchWatchlist();
        return true;
      } else {
        toast.error(data.message || "Failed to update alert");
        return false;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update alert");
      console.error("Failed to update alert", err);
      return false;
    }
  };

  const deleteFromWatchlist = async (id: string) => {
    if (!confirm("Are you sure you want to remove this from your watchlist?")) return;

    try {
      await api.delete(`/watchlist/${id}`);
      toast.success("Removed from watchlist");
      fetchWatchlist();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove from watchlist");
      console.error("Failed to remove from watchlist", err);
    }
  };

  const isPriceAlertTriggered = (item: WatchlistItem) => {
    if (!item.targetPrice || !item.lowestPrice) return false;
    return item.lowestPrice <= item.targetPrice;
  };

  const getProgressPercentage = (current: number, target: number) => {
    if (current >= target) return 100;
    return (current / target) * 100;
  };

  const getSavingsAmount = (current: number, target: number) => {
    if (current >= target) return 0;
    return target - current;
  };

  const getStatusColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage <= 70) return "text-green-600";
    if (percentage <= 90) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate watchlist items
  const itemsWithAlerts = watchlist.filter(item => item.targetPrice !== null);
  const itemsWithoutAlerts = watchlist.filter(item => item.targetPrice === null);
  const triggeredAlerts = itemsWithAlerts.filter(isPriceAlertTriggered);
  const activeAlerts = itemsWithAlerts.filter(item => !isPriceAlertTriggered(item));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">
              My Watchlist
            </h1>
            <p className="text-gray-600">
              Track products and get notified when prices drop
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Add to Watchlist
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="text-sm text-gray-600">Total Items</span>
            </div>
            <div className="text-2xl font-bold text-black">
              {watchlist.length}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">With Alerts</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {itemsWithAlerts.length}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-600">Active Alerts</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {activeAlerts.length}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Triggered</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {triggeredAlerts.length}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-black mb-4" />
            <p className="text-gray-600">Loading your watchlist...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && watchlist.length === 0 && (
          <div className="text-center py-20">
            <Bell className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your watchlist is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Add products to your watchlist to track prices and get alerts
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Item
            </button>
          </div>
        )}

        {/* Items with Price Alerts */}
        {itemsWithAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Price Alerts ({itemsWithAlerts.length})
            </h2>
            <div className="space-y-4">
              {itemsWithAlerts.map((item) => {
                const isTriggered = isPriceAlertTriggered(item);
                const cardClass = isTriggered
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-200";

                return (
                  <div
                    key={item.id}
                    className={`${cardClass} border rounded-xl p-5 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-5 h-5 text-gray-500" />
                          <h3 className="font-semibold text-lg text-gray-900">
                            {item.product.name}
                          </h3>
                          {isTriggered && (
                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                              Triggered!
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 ml-7">
                          Category: {item.product.category}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setNewAlert({
                              productId: item.productId,
                              productName: item.product.name,
                              targetPrice: item.targetPrice?.toString() || "",
                            });
                            setShowCreateModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit alert"
                        >
                          <Target className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => deleteFromWatchlist(item.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Target Price */}
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Target Price
                        </div>
                        <div className="font-semibold text-gray-900">
                          ₦{item.targetPrice?.toLocaleString()}
                        </div>
                      </div>

                      {/* Current/Lowest Price */}
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">Lowest Market Price</div>
                        <div className={`font-semibold ${isTriggered ? "text-green-600 text-lg" : "text-gray-900"}`}>
                          {item.lowestPrice
                            ? `₦${item.lowestPrice.toLocaleString()}`
                            : "No price data"}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {item.lowestPrice && item.targetPrice && !isTriggered && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress to target</span>
                            <span>
                              {getProgressPercentage(item.lowestPrice, item.targetPrice).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black rounded-full transition-all duration-500"
                              style={{
                                width: `${getProgressPercentage(
                                  item.lowestPrice,
                                  item.targetPrice
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Savings Potential */}
                      {item.lowestPrice && item.targetPrice && !isTriggered && (
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Potential savings
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            ₦{getSavingsAmount(item.lowestPrice, item.targetPrice).toLocaleString()}
                          </div>
                        </div>
                      )}

                      {/* Triggered Message */}
                      {isTriggered && (
                        <div className="flex justify-between items-center pt-2 border-t border-green-200">
                          <div className="text-sm text-green-700">
                            🎉 Price dropped below your target!
                          </div>
                          <button
                            onClick={() => navigate(`/products/${item.productId}`)}
                            className="text-sm text-green-700 font-medium hover:underline flex items-center gap-1"
                          >
                            View Product
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Created Date */}
                      <div className="text-xs text-gray-400 pt-2">
                        Added: {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items without Alerts (Just Watching) */}
        {itemsWithoutAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-600" />
              Just Watching ({itemsWithoutAlerts.length})
            </h2>
            <div className="space-y-4">
              {itemsWithoutAlerts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-5 h-5 text-gray-500" />
                        <h3 className="font-semibold text-lg text-gray-900">
                          {item.product.name}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          No alert set
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 ml-7">
                        Category: {item.product.category}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setNewAlert({
                            productId: item.productId,
                            productName: item.product.name,
                            targetPrice: "",
                          });
                          setShowCreateModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Add price alert"
                      >
                        <Target className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => deleteFromWatchlist(item.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Lowest Price */}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Lowest Market Price</div>
                      <div className="font-semibold text-gray-900">
                        {item.lowestPrice
                          ? `₦${item.lowestPrice.toLocaleString()}`
                          : "No price data"}
                      </div>
                    </div>

                    {/* Add Alert Button */}
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setNewAlert({
                            productId: item.productId,
                            productName: item.product.name,
                            targetPrice: "",
                          });
                          setShowCreateModal(true);
                        }}
                        className="w-full py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Target className="w-4 h-4" />
                        Set Price Alert
                      </button>
                    </div>

                    {/* Created Date */}
                    <div className="text-xs text-gray-400 pt-2">
                      Added: {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Watchlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-6 h-6 text-black" />
                    <h2 className="text-2xl font-bold text-black">
                      {editingItem ? "Edit Price Alert" : "Add to Watchlist"}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingItem(null);
                      setSearchTerm("");
                      setNewAlert({ productId: "", productName: "", targetPrice: "" });
                    }}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Product Selection (only show if not editing) */}
                  {!editingItem && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Product
                      </label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => {
                                setNewAlert({
                                  ...newAlert,
                                  productId: product.id,
                                  productName: product.name,
                                });
                                setSearchTerm("");
                              }}
                              className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                                newAlert.productId === product.id ? "bg-gray-100" : ""
                              }`}
                            >
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.category}</div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            {searchTerm ? "No products found" : "Loading products..."}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Target Price (Optional for new, Required for editing) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Price {!editingItem && "(Optional)"}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={newAlert.targetPrice}
                        onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                        placeholder="e.g., 40000"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        min="0"
                        step="100"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {editingItem
                        ? "You'll be notified when price drops to or below this amount"
                        : "Leave empty to just save to watchlist without price alert"}
                    </p>
                  </div>

                  {/* Selected Product Display */}
                  {newAlert.productName && !editingItem && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Selected Product:</p>
                      <p className="font-medium text-gray-900">{newAlert.productName}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingItem(null);
                        setSearchTerm("");
                        setNewAlert({ productId: "", productName: "", targetPrice: "" });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (editingItem) {
                          const targetPrice = newAlert.targetPrice ? Number(newAlert.targetPrice) : null;
                          await updateTargetPrice(editingItem.id, targetPrice);
                          setShowCreateModal(false);
                          setEditingItem(null);
                          setNewAlert({ productId: "", productName: "", targetPrice: "" });
                        } else {
                          if (!newAlert.productId) {
                            toast.error("Please select a product");
                            return;
                          }
                          const targetPrice = newAlert.targetPrice ? Number(newAlert.targetPrice) : undefined;
                          await addToWatchlist(newAlert.productId, targetPrice);
                          setShowCreateModal(false);
                          setNewAlert({ productId: "", productName: "", targetPrice: "" });
                          setSearchTerm("");
                        }
                      }}
                      disabled={!editingItem && !newAlert.productId}
                      className="flex-1 bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingItem ? "Update Alert" : "Add to Watchlist"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}