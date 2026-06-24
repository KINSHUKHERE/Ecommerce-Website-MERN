import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Menu, LogOut, ChevronDown, User, Shield } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Prachi Jain",
    role: "admin",
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  // Close sidebar drawer on route changes (for mobile view)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex w-full min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 px-4 sm:px-6 flex items-center justify-between shadow-sm shadow-slate-100/40">
          {/* Left Side: Mobile Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 lg:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded bg-[#088178] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                S
              </div>
              <span className="font-bold text-gray-900 text-sm leading-none">
                Veltiq
              </span>
            </div>
          </div>

          {/* Right Side: Profile & Controls */}
          <div className="flex items-center gap-4">
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2.5 py-1.5 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer outline-none focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#088178] text-white flex items-center justify-center font-extrabold text-sm border-2 border-white shadow-sm">
                  {(user?.name?.[0] || "P").toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-gray-950 leading-tight">
                    {user?.name || "Prachi Jain"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase leading-none">
                    {user?.role || "admin"}
                  </span>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white border border-gray-150 rounded-xl shadow-lg py-1.5 z-20 animate-slideDown">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400 font-bold uppercase">
                        Account
                      </p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
                        {user?.email || "admin@Veltiq.com"}
                      </p>
                    </div>
                    <Link
                      to="/admin"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-650 hover:bg-gray-50 hover:text-gray-950 font-medium transition-colors outline-none focus:outline-none"
                    >
                      <Shield size={16} />
                      Admin Panel
                    </Link>
                    <Link
                      to="/admin/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-650 hover:bg-gray-50 hover:text-gray-950 font-medium transition-colors outline-none focus:outline-none"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors border-t border-gray-100 cursor-pointer outline-none focus:outline-none"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 pb-20">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
