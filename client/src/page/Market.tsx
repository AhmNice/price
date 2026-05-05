// pages/Markets.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  MapPin,
  Plus,
  Search,
  ArrowLeft,
  DollarSign,
  Trash2,
  Edit2,
  AlertCircle,
  Loader2,
  Building2
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../store/api";
import { useAuthStore } from "../store/AuthStore";

type Market = {
  id: string;
  name: string;
  location?: string;
  createdAt?: string;
  _count?: {
    prices: number;
  };
};

export default function Markets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const {user} = useAuthStore()
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarkets();
  }, []);

  useEffect(() => {
    filterMarkets();
  }, [searchTerm, markets]);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/markets/list");
      setMarkets(res.data.data || []);
      setFilteredMarkets(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch markets", err);
      toast.error("Failed to load markets");
    } finally {
      setLoading(false);
    }
  };

  const filterMarkets = () => {
    if (!searchTerm.trim()) {
      setFilteredMarkets(markets);
    } else {
      const filtered = markets.filter(market =>
        market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (market.location && market.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMarkets(filtered);
    }
  };

  const deleteMarket = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all price records for this market.`)) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/markets/${id}`);
      toast.success("Market deleted successfully");
      fetchMarkets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete market");
      console.error("Failed to delete market", err);
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">
              Markets
            </h1>
            <p className="text-gray-600">
              Manage markets where prices are tracked
            </p>
          </div>
         { user && user.role === "admin" && (
           <button
            onClick={() => navigate("/add-market")}
            className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Add Market
          </button>
         )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Store className="w-5 h-5 text-gray-700" />
              <span className="text-sm text-gray-600">Total Markets</span>
            </div>
            <div className="text-2xl font-bold text-black">
              {markets.length}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-5 h-5 text-gray-700" />
              <span className="text-sm text-gray-600">With Locations</span>
            </div>
            <div className="text-2xl font-bold text-black">
              {markets.filter(m => m.location).length}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-gray-700" />
              <span className="text-sm text-gray-600">Active Tracking</span>
            </div>
            <div className="text-2xl font-bold text-black">
              {markets.filter(m => (m._count?.prices || 0) > 0).length}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-black mb-4" />
            <p className="text-gray-600">Loading markets...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && markets.length === 0 && (
          <div className="text-center py-20">
            <Store className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No markets available
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first market to start tracking prices
            </p>
            <button
              onClick={() => navigate("/add-market")}
              className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Market
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && markets.length > 0 && filteredMarkets.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No markets found
            </h3>
            <p className="text-gray-600">
              No markets match "{searchTerm}"
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-black hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Markets Grid */}
        {!loading && filteredMarkets.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredMarkets.map((market) => (
              <div
                key={market.id}
                className="group bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(market.name)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-black transition-colors">
                            {market.name}
                          </h3>
                          {market.location && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-500">{market.location}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => deleteMarket(market.id, market.name)}
                        disabled={deletingId === market.id}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group/delete"
                      >
                        {user && user.role === "admin" && deletingId === market.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Market Stats */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Price Records</span>
                      <span className="font-medium text-gray-900">
                        {market._count?.prices || 0}
                      </span>
                    </div>

                    {/* Created Date */}
                    {market.createdAt && (
                      <div className="text-xs text-gray-400">
                        Added: {new Date(market.createdAt).toLocaleDateString()}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      {user && user.role === "admin" && (
                        <button
                        onClick={() => navigate("/add-price", { state: { marketId: market.id, marketName: market.name } })}
                        className="flex-1 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                      >
                        <DollarSign className="w-4 h-4" />
                        Add Price
                      </button>
                      )}
                      <button
                        onClick={() => navigate(`/markets/${market.id}/prices`)}
                        className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        View Prices
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Add Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Market Management Tips</p>
              <ul className="space-y-1 text-xs">
                <li>• Add markets with accurate names and locations for better user experience</li>
                <li>• Markets cannot be deleted if they have price records</li>
                <li>• Each market can have multiple price records for different products</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}