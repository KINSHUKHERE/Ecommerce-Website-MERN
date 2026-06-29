import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Menu, LogOut, ChevronDown, User, Shield } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import logo from "../../assets/logo.png";

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
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

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
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/75 backdrop-blur-md border-b border-light-border/40 h-16 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
          {/* Left Side: Mobile Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
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
                      to="/admin"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-muted-gray hover:bg-slate-50 hover:text-dark-navy font-bold uppercase tracking-wider transition-colors outline-none focus:outline-none"
                    >
                      <Shield size={14} className="text-primary" />
                      Admin Panel
                    </Link>
                    <Link
                      to="/admin/profile"
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
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
