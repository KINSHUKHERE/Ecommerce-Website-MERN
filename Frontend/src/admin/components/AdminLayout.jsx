import React, { useState, useEffect, Suspense } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Menu, LogOut, ChevronDown, User, Shield, Loader2 } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import logo from "../../assets/logo.png";
import { getGlobalSaleConfig } from "../../api/SaleApi";
import NotificationBell from "./NotificationBell";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Prachi Jain",
    role: "admin",
  };

  const routePrefix = user?.role === "vendor" ? "/vendor" : "/admin";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const [globalSale, setGlobalSale] = useState(() => {
    try {
      const cached = sessionStorage.getItem("globalSaleConfig");
      return cached ? JSON.parse(cached) : { isGlobalSaleActive: false, saleName: "Festive Season Sale" };
    } catch {
      return { isGlobalSaleActive: false, saleName: "Festive Season Sale" };
    }
  });

  useEffect(() => {
    const fetchGlobalSale = async () => {
      try {
        const response = await getGlobalSaleConfig();
        if (response.data && response.data.config) {
          setGlobalSale(response.data.config);
          sessionStorage.setItem("globalSaleConfig", JSON.stringify(response.data.config));
        }
      } catch (err) {
        console.log("Unable to fetch global sale config", err);
      }
    };

    fetchGlobalSale();

    const handleConfigEvent = () => {
      const freshCached = sessionStorage.getItem("globalSaleConfig");
      if (freshCached) {
        setGlobalSale(JSON.parse(freshCached));
      }
    };
    window.addEventListener("saleConfigUpdated", handleConfigEvent);
    return () => window.removeEventListener("saleConfigUpdated", handleConfigEvent);
  }, []);

  // Close sidebar drawer on route changes (for mobile view)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex w-full min-h-screen bg-soft-bg text-dark-navy font-sans antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {(() => {
          const getBannerGradient = (theme) => {
            switch (theme) {
              case "diwali":
                return "from-orange-600 via-amber-500 to-yellow-500";
              case "summer":
                return "from-yellow-400 via-orange-400 to-amber-500";
              case "winter":
                return "from-blue-600 via-cyan-500 to-sky-400";
              case "holi":
                return "from-pink-500 via-purple-500 to-emerald-400";
              case "christmas":
                return "from-red-700 via-emerald-750 to-green-600";
              case "yocart":
                return "from-violet-600 via-fuchsia-600 to-indigo-650";
              default:
                return "from-red-600 via-orange-500 to-amber-500";
            }
          };

          return globalSale.isGlobalSaleActive && user?.role === "vendor" && (
            <div className={`w-full bg-gradient-to-r ${getBannerGradient(globalSale.saleTheme)} text-white text-[10px] sm:text-[11px] font-black py-1.5 px-4 flex items-center justify-center gap-2 select-none shadow-xs overflow-hidden relative z-40`}>
              <span className="animate-pulse">🎉</span>
              <span className="uppercase tracking-wider">{globalSale.saleName} IS LIVE! UP TO 60% OFF - LIMITED TIME ONLY!</span>
              <span className="animate-pulse">🎉</span>
            </div>
          );
        })()}
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/75 backdrop-blur-md border-b border-light-border/40 h-16 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
          {/* Left Side: Mobile Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Sidebar Menu"
              className="p-1.5 text-muted-gray hover:text-dark-navy rounded-xl hover:bg-slate-50 lg:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center lg:hidden">
              <img src={logo} alt="YoCart" className="h-7 w-auto object-contain" />
            </div>
          </div>

          {/* Right Side: Profile & Controls */}
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <NotificationBell />

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2.5 py-1.5 px-2.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer outline-none focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm border-2 border-white shadow-xs overflow-hidden">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user?.name?.[0] || "P").toUpperCase()
                  )}
                </div>
                <div className="hidden sm:block text-left select-none">
                  <span className="block text-xs font-bold text-dark-navy leading-tight">
                    {user?.name || "Prachi Jain"}
                  </span>
                  <span className="text-[10px] text-muted-gray font-bold uppercase leading-none mt-0.5 block">
                    {user?.role || "admin"}
                  </span>
                </div>
                <ChevronDown size={14} className="text-muted-gray" />
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white border border-light-border rounded-2xl shadow-lg py-1.5 z-20 animate-slideDown">
                    <div className="px-4 py-2 border-b border-light-border/40">
                      <p className="text-[10px] text-muted-gray font-extrabold uppercase tracking-wider">
                        Account
                      </p>
                      <p className="text-xs font-semibold text-dark-navy mt-0.5 truncate">
                        {user?.email || "herekinshuk@gmail.com"}
                      </p>
                    </div>
                    <Link
                      to={routePrefix}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-muted-gray hover:bg-slate-50 hover:text-dark-navy font-bold uppercase tracking-wider transition-colors outline-none focus:outline-none"
                    >
                      <Shield size={14} className="text-primary" />
                      {user?.role === "vendor" ? "Seller Portal" : "Admin Panel"}
                    </Link>
                    <Link
                      to={`${routePrefix}/profile`}
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-muted-gray hover:bg-slate-50 hover:text-dark-navy font-bold uppercase tracking-wider transition-colors outline-none focus:outline-none"
                    >
                      <User size={14} className="text-primary" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-655 hover:bg-red-50 hover:text-red-700 font-bold uppercase tracking-wider transition-colors border-t border-light-border/40 cursor-pointer outline-none focus:outline-none"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 pb-20 bg-soft-bg">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-20 w-full min-h-[300px]">
              <Loader2 className="animate-spin text-primary w-8 h-8 mb-2" />
              <span className="text-xs font-semibold text-muted-gray">Loading page content...</span>
            </div>
          }>
            {children || <Outlet />}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
