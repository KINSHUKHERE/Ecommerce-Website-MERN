import React, { useEffect, useState } from "react";
import {
  Package,
  Users,
  ShoppingCart,
  IndianRupee,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { getDashboardData } from "../../api/DashboardApi";

const AdminDashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Vendor summary stats for Super Admin
  const [totalVendors, setTotalVendors] = useState(0);
  const [pendingVendors, setPendingVendors] = useState(0);
  const [activeVendors, setActiveVendors] = useState(0);
  const [suspendedVendors, setSuspendedVendors] = useState(0);

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Admin",
    role: "admin",
  };

  const isVendor = user.role === "vendor";
  const isAdmin = user.role === "admin";
  const isVendorPendingOrSuspended = isVendor && user.vendorStatus !== "active";

  const fetchData = async () => {
    try {
      const getInfo = await getDashboardData(user);
      setTotalProducts(getInfo.totalPro);
      setTotalOrders(getInfo.totalOrd);
      setTotalUsers(getInfo.totalUse);
      setTotalContacts(getInfo.totalCon);
      setTotalRevenue(getInfo.totalRev);

      if (user.role === "admin") {
        setTotalVendors(getInfo.totalVendors || 0);
        setPendingVendors(getInfo.pendingVendors || 0);
        setActiveVendors(getInfo.activeVendors || 0);
        setSuspendedVendors(getInfo.suspendedVendors || 0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const businessOverviewCards = [
    {
      title: "Total Products",
      value: totalProducts,
      iconClass: Package,
      badge: "Catalog",
      show: true,
    },
    {
      title: "Total Users",
      value: totalUsers,
      iconClass: Users,
      badge: "Accounts",
      show: !isVendor,
    },
    {
      title: "Total Orders",
      value: totalOrders,
      iconClass: ShoppingCart,
      badge: "Sales",
      show: true,
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      iconClass: IndianRupee,
      badge: "Revenue",
      show: true,
    },
  ].filter((c) => c.show);

  const marketplaceOverviewCards = [
    {
      title: "Total Vendors",
      value: totalVendors,
      iconClass: Users,
      badge: "Sellers",
      show: user.role === "admin",
    },
    {
      title: "Pending Vendor Requests",
      value: pendingVendors,
      iconClass: Clock,
      badge: "Pending",
      show: user.role === "admin",
    },
    {
      title: "Contact Queries",
      value: totalContacts,
      iconClass: MessageSquare,
      badge: "Support",
      show: user.role === "admin",
    },
    {
      title: "Total Reviews",
      value: 0,
      iconClass: CheckCircle,
      badge: "Ratings",
      show: user.role === "admin",
    },
  ].filter((c) => c.show);

  const firstName = user?.name ? user.name.split(" ")[0] : "Admin";

  if (isVendorPendingOrSuspended) {
    return (
      <div className="relative text-dark-navy antialiased text-left space-y-6">
        <div className="mb-4 sm:mb-8 text-left">
          <h1 className="text-xl sm:text-3xl font-extrabold text-dark-navy tracking-tight leading-tight">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-gray mt-1.5 font-medium leading-relaxed">
            Your seller workspace status is overviewed below.
          </p>
        </div>

        <div className="bg-white border border-light-border/60 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden max-w-xl">
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${user.vendorStatus === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
              user.vendorStatus === 'pending' 
                ? 'bg-amber-50 text-amber-500 border-amber-100' 
                : 'bg-red-50 text-red-655 border-red-100'
            }`}>
              {user.vendorStatus === 'pending' ? <Clock size={22} /> : <AlertTriangle size={22} />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-muted-gray uppercase tracking-widest leading-none">
                Seller Account Status
              </h3>
              <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-current ${
                user.vendorStatus === 'pending' 
                  ? 'bg-amber-50 text-amber-600 border-amber-100' 
                  : 'bg-red-50 text-red-655 border-red-100'
              }`}>
                {user.vendorStatus === 'pending' ? 'Pending Approval' : 'Suspended'}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-gray leading-relaxed font-semibold mb-6">
            {user.vendorStatus === 'pending'
              ? "Your seller account is currently under review by our administrator team. Once approved, you will be unlocked to configure products, view complete metrics, and process customer orders."
              : "Your seller account has been suspended by the marketplace administrator. Your current listings are hidden from search and checkout. Please contact the administrator team to appeal or reactivate your account."}
          </p>

          <div className="border-t border-light-border/40 pt-5">
            <h4 className="text-xs font-extrabold text-dark-navy uppercase tracking-widest mb-3">
              Locked Portal Features:
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2.5 text-xs text-muted-gray font-bold">
                <span className="text-red-500 font-extrabold">✗</span> Add / Edit / Remove Products
              </li>
              <li className="flex items-center gap-2.5 text-xs text-muted-gray font-bold">
                <span className="text-red-500 font-extrabold">✗</span> Process Checkout Orders
              </li>
              <li className="flex items-center gap-2.5 text-xs text-muted-gray font-bold">
                <span className="text-red-500 font-extrabold">✗</span> View Advanced Shop Analytics
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-dark-navy antialiased">
      {/* Header */}
      <div className="mb-4 sm:mb-8 text-left border-b border-light-border/40 pb-4">
        <h1 className="text-xl sm:text-3xl font-extrabold text-dark-navy tracking-tight leading-tight">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-xs sm:text-sm text-muted-gray mt-1.5 font-semibold leading-relaxed">
          {isVendor 
            ? "Here's a comprehensive snapshot of your seller shop's performance, catalog overview, and product orders."
            : "Here's a comprehensive snapshot of your YoCart store's performance, catalog overview, and customer inquiries."}
        </p>
      </div>

      {/* First Row (Business Overview) */}
      <div className="text-left">
        <h2 className="text-xs font-extrabold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>📦</span> Business Overview
        </h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {businessOverviewCards.map((card, index) => {
            const IconComponent = card.iconClass;
            return (
              <div
                key={index}
                className="bg-white border border-light-border/60 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-light-border/30 group-hover:bg-primary transition-colors duration-300"></div>
                <div className="flex items-center justify-between">
                  <div className="text-primary bg-primary/5 border border-primary/10 w-8 h-8 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-extrabold uppercase bg-primary/5 text-primary border border-primary/10 px-2.5 py-0.5 rounded-full">
                    {card.badge}
                  </span>
                </div>
                <h3 className="mt-3 text-[9px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-wider leading-none">
                  {card.title}
                </h3>
                <p className="mt-2 text-base sm:text-2xl font-black text-dark-navy tracking-tight break-words">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Second Row (Marketplace Overview) - Admin Only */}
      {isAdmin && marketplaceOverviewCards.length > 0 && (
        <div className="text-left pt-2">
          <h2 className="text-xs font-extrabold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>🏪</span> Marketplace Overview
          </h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {marketplaceOverviewCards.map((card, index) => {
              const IconComponent = card.iconClass;
              return (
                <div
                  key={index}
                  className="bg-white border border-light-border/60 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-light-border/30 group-hover:bg-primary transition-colors duration-300"></div>
                  <div className="flex items-center justify-between">
                    <div className="text-primary bg-primary/5 border border-primary/10 w-8 h-8 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-extrabold uppercase bg-primary/5 text-primary border border-primary/10 px-2.5 py-0.5 rounded-full">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[9px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-wider leading-none">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-base sm:text-2xl font-black text-dark-navy tracking-tight break-words">
                    {card.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
