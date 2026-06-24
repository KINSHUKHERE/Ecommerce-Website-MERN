import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [productsMenuOpen, setProductsMenuOpen] = useState(
    location.pathname.startsWith("/admin/products") ||
      location.pathname === "/create-product",
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  const isActive = (path) => {
    if (path === "/admin/products") {
      return location.pathname.startsWith("/admin/products");
    }
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={18} />,
    },
    {
      title: "Products",
      icon: <ShoppingBag size={18} />,
      submenu: [
        {
          title: "All Products",
          path: "/admin/products",
          icon: <List size={16} />,
        },
        {
          title: "Create Product",
          path: "/create-product",
          icon: <PlusCircle size={16} />,
        },
      ],
    },
    {
      title: "Categories",
      path: "/categories",
      icon: <Tag size={18} />,
    },
    {
      title: "Variants (Brands)",
      path: "/variants",
      icon: <Layers size={18} />,
    },
    {
      title: "Orders",
      path: "/order-details",
      icon: <FileText size={18} />,
    },
    {
      title: "Contact Queries",
      path: "/contact-details",
      icon: <MessageSquare size={18} />,
    },
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-gray-150 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <Link
            to="/admin"
            className="flex items-center gap-2.5"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-[#088178] flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              S
            </div>
            <div className="text-left">
              <span className="block font-bold text-gray-900 text-base leading-none">
                Veltiq
              </span>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                Shop Smart
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-450 hover:text-gray-650 lg:hidden cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-1.5">
          {menuItems.map((item, idx) => {
            if (item.submenu) {
              return (
                <div key={idx} className="space-y-1">
                  <button
                    onClick={() => setProductsMenuOpen(!productsMenuOpen)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isActive("/admin/products") || isActive("/create-product")
                        ? "bg-[#088178]/5 text-[#088178]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
                          to={sub.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                            isActive(sub.path)
                              ? "bg-[#088178]/10 text-[#088178]"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-950"
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

            return (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? "bg-[#088178]/10 text-[#088178]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
