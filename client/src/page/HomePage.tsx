// pages/Home.tsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Bell,
  BarChart3,
  Shield,
  CheckCircle2,
  MapPin,
  Users,
  Zap,
  Activity,
  ShoppingBag,
  AlertCircle
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function Home() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Mock price updates
  const [priceUpdates] = useState([
    { name: "Rice (50kg)", price: "₦45,000 - ₦48,000", trend: "stable" },
    { name: "Garri (50kg)", price: "₦28,000 - ₦30,000", trend: "down" },
    { name: "Tomatoes (1kg)", price: "₦800 - ₦1,200", trend: "up" },
    { name: "Onions (1kg)", price: "₦600 - ₦900", trend: "down" },
  ]);

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <TrendingUp className="w-3 h-3" />;
      case 'down': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch(trend) {
      case 'up': return "bg-red-100 text-red-600";
      case 'down': return "bg-green-100 text-green-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar/>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative monochrome elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="max-w-6xl mx-auto px-4 py-10 lg:py-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Activity className="w-4 h-4" />
                Live Price Updates
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
                Save Money on{" "}
                <span className="border-b-4 border-black">
                  Everyday Goods
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Compare prices across local markets, track price trends, and get instant alerts when prices drop. Smart shopping made simple.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => navigate("/products")}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="group relative bg-black text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Start Comparing Prices
                  <ArrowRight className="inline-block ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className="bg-white text-black px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-300 hover:border-black hover:shadow-md transition-all duration-300"
                >
                  <Bell className="inline-block mr-2 w-5 h-5" />
                  Create Price Alert
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-700" />
                  <span>500+ Markets Tracked</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-700" />
                  <span>10,000+ Happy Shoppers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-700" />
                  <span>Real-time Updates</span>
                </div>
              </div>
            </div>

            {/* Right Column - Live Price Cards */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-gray-700" />
                  Live Market Prices
                </h3>
                <div className="space-y-3">
                  {priceUpdates.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getTrendColor(item.trend)}`}>
                          {getTrendIcon(item.trend)}
                          {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} {item.trend}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Alert CTA */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="bg-black rounded-full p-2">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Want to save more?</p>
                    <p className="text-xs text-gray-500 mt-1">Set price alerts and get notified when your favorite items go on sale</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                <ShoppingBag className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Price Comparison</h3>
              <p className="text-gray-600 text-sm">Compare prices across multiple markets instantly</p>
            </div>

            <div className="text-center group">
              <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                <Bell className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Price Alerts</h3>
              <p className="text-gray-600 text-sm">Get notified when prices drop on your favorite items</p>
            </div>

            <div className="text-center group">
              <div className="bg-gray-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                <Shield className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trusted Sources</h3>
              <p className="text-gray-600 text-sm">Verified prices from local markets and vendors</p>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gray-900 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-3">Ready to start saving?</h2>
              <p className="text-gray-300 mb-6">Join thousands of smart shoppers tracking prices daily</p>
              <button
                onClick={() => navigate("/products")}
                className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center gap-2"
              >
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}