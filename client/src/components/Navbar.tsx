// components/Navbar.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  ShoppingBag,
  Menu,
  X,
  Home,
  Package,
  LineChart,
  User,
  LogOut,
  UserCircle,
  MapPin,
  Store
} from "lucide-react";
import { useAuthStore } from "../store/AuthStore";


export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/products", label: "Products", icon: Package },
    { path: "/trends", label: "Price Trends", icon: LineChart },
    {path: "/markets", label: "Markets", icon: Store},
    { path: "/alerts", label: "Alerts", icon: Bell },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <ShoppingBag className="w-6 h-6 text-black transition-transform group-hover:scale-105" />
            <span className="font-bold text-xl text-black">MarketTracker</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    relative flex items-center gap-2 px-2 py-1 transition-all duration-300
                    ${active
                      ? "text-black font-semibold"
                      : "text-gray-600 hover:text-black"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-black" : "text-gray-500"}`} />
                  {item.label}

                  {/* Active indicator */}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full animate-slideIn" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <UserCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-slideDown">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all hover:scale-105"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slideDown">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${active
                        ? "bg-gray-100 text-black font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${active ? "text-black" : "text-gray-500"}`} />
                    {item.label}
                    {active && (
                      <div className="ml-auto w-1 h-6 bg-black rounded-full" />
                    )}
                  </button>
                );
              })}

              <div className="border-t border-gray-100 my-2"></div>

              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate("/register");
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-center"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global styles for animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            transform: scaleX(0);
            opacity: 0;
          }
          to {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </nav>
  );
}