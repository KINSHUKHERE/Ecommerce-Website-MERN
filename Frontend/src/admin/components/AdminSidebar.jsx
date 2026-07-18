import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Layers,
  FileText,
  MessageSquare,
  LogOut,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  List,
  X,
  Users,
  Flame,
  Star,
  User,
  Shield,
} from "lucide-react";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [productsMenuOpen, setProductsMenuOpen] = useState(
    location.pathname.startsWith("/admin/products") ||
      location.pathname === "/create-product",
  );
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const isVendor = user.role === "vendor";
  const isAdmin = user.role === "admin";
  const isLocked = isVendor && user.vendorStatus !== "active";
  const routePrefix = isVendor ? "/vendor" : "/admin";

  const getRolePath = (path) => {
    if (!path) return "";
    if (isVendor) {
      if (path.startsWith("/admin")) {
        return path.replace("/admin", "/vendor");
      }
      if (path === "/create-product") {
        return "/vendor/create-product";
      }
      if (path === "/order-details") {
        return "/vendor/order-details";
      }
    }
    return path;
  };

  const isActive = (path) => {
    const targetPath = getRolePath(path);
    if (targetPath.endsWith("/products")) {
      return location.pathname.startsWith(targetPath);
    }
    return location.pathname === targetPath;
  };

  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={16} />,
    },
    {
      title: "Festive Sale",
      path: "/admin/sale",
      icon: <Flame size={16} />,
    },
    {
      title: "Products",
      icon: <ShoppingBag size={16} />,
      isLocked,
      submenu: [
        {
          title: "All Products",
          path: "/admin/products",
          icon: <List size={14} />,
        },
        {
          title: "Create Product",
          path: "/create-product",
          icon: <PlusCircle size={14} />,
        },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: "Categories",
            path: "/categories",
            icon: <Tag size={16} />,
          },
          {
            title: "Brands",
            path: "/brands",
            icon: <Layers size={16} />,
          },
          {
            title: "Customer Reviews",
            path: "/admin/reviews",
            icon: <Star size={16} />,
          },
        ]
      : []),
    {
      title: "Orders",
      path: "/order-details",
      icon: <FileText size={16} />,
      isLocked,
    },
    ...(isAdmin
      ? [
          {
            title: "Vendors",
            path: "/admin/vendors",
            icon: <Users size={16} />,
          },
          {
            title: "Users",
            path: "/admin/users",
            icon: <Users size={16} />,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: "Contact Queries",
            path: "/contact-details",
            icon: <MessageSquare size={16} />,
          },
        ]
      : []),
    ...(isVendor
      ? [
          {
            title: "Store Profile",
            path: "/admin/profile",
            icon: <Users size={16} />,
          },
          {
            title: "Customer Reviews",
            path: "/admin/reviews",
            icon: <Star size={16} />,
          },
          {
            title: "Support Query",
            path: "/admin/support",
            icon: <MessageSquare size={16} />,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-light-border/40 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-light-border/40">
          <Link
            to={routePrefix}
            className="flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <img src={logo} alt="YoCart" className="h-8 w-auto object-contain" />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close Sidebar Navigation"
            className="p-1.5 text-muted-gray hover:text-dark-navy lg:hidden cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-2 select-none text-left custom-scrollbar">
          {menuItems.map((item, idx) => {
            if (item.submenu) {
              const isSubmenuActive = isActive("/admin/products") || isActive("/create-product");
              
              if (item.isLocked) {
                return (
                  <div key={idx} className="space-y-1 opacity-60 cursor-not-allowed select-none">
                    <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-muted-gray">
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.title} 🔒</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="space-y-1">
                  <button
                    onClick={() => setProductsMenuOpen(!productsMenuOpen)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      isSubmenuActive
                        ? "bg-primary/5 text-primary"
                        : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    {productsMenuOpen ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                  {productsMenuOpen && (
                    <div className="pl-6 pr-2 py-1 space-y-1">
                      {item.submenu.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          to={getRolePath(sub.path)}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            isActive(sub.path)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                          }`}
                        >
                          {sub.icon}
                          <span>{sub.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (item.isLocked) {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-muted-gray opacity-60 cursor-not-allowed select-none"
                >
                  {item.icon}
                  <span>{item.title} 🔒</span>
                </div>
              );
            }

            const isCurrentActive = isActive(item.path);
            return (
              <Link
                key={idx}
                to={getRolePath(item.path)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                  isCurrentActive
                    ? "bg-primary/5 text-primary"
                    : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="p-4 border-t border-light-border/40 space-y-3.5 relative">
          {/* User Profile Card */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition duration-300 cursor-pointer text-left outline-none focus:outline-none"
            >
              <div className="flex items-center gap-3">
                {/* Avatar with status indicator */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm border-2 border-white shadow-xs overflow-hidden">
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
                  {/* Online indicator dot */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>

                <div className="min-w-0 select-none">
                  <span className="block text-xs font-bold text-dark-navy leading-tight truncate max-w-[120px]">
                    {user?.name || "Prachi Jain"}
                  </span>
                  <span className="text-[10px] text-muted-gray font-bold uppercase leading-none mt-0.5 block">
                    {user?.role || "admin"}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${profileMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Upward Dropdown Popup Menu */}
            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 right-0 z-50 mb-2 bg-white border border-light-border rounded-2xl shadow-xl py-1.5 animate-slideUp">
                  <div className="px-4 py-2 border-b border-light-border/40 text-left">
                    <p className="text-[9px] text-muted-gray font-extrabold uppercase tracking-wider">
                      Account
                    </p>
                    <p className="text-[11px] font-semibold text-dark-navy mt-0.5 truncate">
                      {user?.email || "herekinshuk@gmail.com"}
                    </p>
                  </div>
                  <Link
                    to={routePrefix}
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-4 py-2 text-[11px] text-muted-gray hover:bg-slate-50 hover:text-dark-navy font-bold uppercase tracking-wider transition-colors outline-none focus:outline-none text-left"
                  >
                    <Shield size={14} className="text-primary" />
                    {user?.role === "vendor" ? "Seller Portal" : "Admin Panel"}
                  </Link>
                  <Link
                    to={`${routePrefix}/profile`}
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-4 py-2 text-[11px] text-muted-gray hover:bg-slate-50 hover:text-dark-navy font-bold uppercase tracking-wider transition-colors outline-none focus:outline-none text-left"
                  >
                    <User size={14} className="text-primary" />
                    My Profile
                  </Link>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-red-655 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
