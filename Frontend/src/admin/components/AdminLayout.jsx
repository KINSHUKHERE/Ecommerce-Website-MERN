import { useState, useEffect, Suspense } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Menu, Loader2 } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import logo from "../../assets/logo.png";
import { getGlobalSaleConfig } from "../../api/SaleApi";
import NotificationBell from "./NotificationBell";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Prachi Jain",
    role: "admin",
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
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 relative">
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
        <header className="sticky top-0 z-30 bg-white/75 backdrop-blur-md border-b border-light-border/40 h-16 px-4 sm:px-6 flex items-center justify-between shadow-2xs lg:hidden">
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

          {/* Right Side: Clean empty spacer or additional buttons if needed */}
          <div className="flex items-center gap-4">
            {/* Kept clean / Empty spacer */}
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

        {/* Floating Notification FAB Widget */}
        <NotificationBell />
      </div>
    </div>
  );
};

export default AdminLayout;
