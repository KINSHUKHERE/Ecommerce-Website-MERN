import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Users,
  ShoppingCart,
  IndianRupee,
  MessageSquare,
  Clock,
  AlertTriangle,
  Download
} from "lucide-react";
import { getDashboardData } from "../../api/DashboardApi";
import { calculateVendorCommission } from "../../utils/commissionHelper";

// Import Reusable Dashboard Subcomponents
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";
import KpiCard from "../../components/dashboard/KpiCard";
import SalesTrendChart from "../../components/dashboard/SalesTrendChart";
import OrdersPieChart from "../../components/dashboard/OrdersPieChart";
import CategoryChart from "../../components/dashboard/CategoryChart";
import InventoryChart from "../../components/dashboard/InventoryChart";
import TopProductsChart from "../../components/dashboard/TopProductsChart";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("all");

  // Raw states returned by api
  const [rawData, setRawData] = useState({
    totalPro: 0,
    totalCon: 0,
    totalUse: 0,
    totalOrd: 0,
    totalRev: 0,
    totalVendors: 0,
    pendingVendors: 0,
    activeVendors: 0,
    suspendedVendors: 0,
    orders: [],
    products: [],
    vendors: [],
    users: []
  });

  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    name: "Admin",
    role: "admin"
  };

  const isVendor = currentUser.role === "vendor";
  const isAdmin = currentUser.role === "admin";
  const isVendorPendingOrSuspended = isVendor && currentUser.vendorStatus !== "active";

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData(currentUser);
      setRawData(data);
    } catch (error) {
      console.error("Dashboard data load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute all dashboard statistics in a single useMemo loop
  const analytics = useMemo(() => {
    const { orders = [], products = [], vendors = [], users = [] } = rawData;

    // Filter products by vendor if isolated
    const vendorProducts = isVendor
      ? products.filter(p => {
          const pVendorId = p.vendorId?._id ? p.vendorId._id.toString() : p.vendorId?.toString();
          return pVendorId === currentUser._id;
        })
      : products;

    const vendorProductIds = new Set(vendorProducts.map(p => p._id));

    // Resolve accurate vendor items list inside orders
    const getVendorOrderAmt = (order) => {
      return order.items.reduce((sum, item) => {
        const pid = item.productId?._id ? item.productId._id.toString() : item.productId?.toString();
        return vendorProductIds.has(pid)
          ? sum + (item.price * (item.quantity || 1))
          : sum;
      }, 0);
    };

    // Filter orders belonging to vendor
    const relevantOrders = isVendor
      ? orders.filter(o => o.items.some(item => {
          const pid = item.productId?._id ? item.productId._id.toString() : item.productId?.toString();
          return vendorProductIds.has(pid);
        }))
      : orders;

    // Time ranges cutoffs
    const now = new Date();
    let cutoffDate = new Date(0);
    if (selectedTimeFilter === "today") {
      cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (selectedTimeFilter === "7days") {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (selectedTimeFilter === "30days") {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (selectedTimeFilter === "6months") {
      cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    } else if (selectedTimeFilter === "year") {
      cutoffDate = new Date(now.getFullYear(), 0, 1);
    }

    const filteredOrders = relevantOrders.filter(o => new Date(o.createdAt) >= cutoffDate);

    // Percentage comparison dates (Current vs Previous Month)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. KPI - Revenue
    const calculateRev = (list) => {
      return list.reduce((sum, o) => {
        if (o.orderStatus === "Cancelled") return sum;
        return sum + (isVendor ? getVendorOrderAmt(o) : o.totalAmount);
      }, 0);
    };

    const totalRev = calculateRev(filteredOrders);
    const currMonthRev = calculateRev(relevantOrders.filter(o => new Date(o.createdAt) >= currentMonthStart));
    const prevMonthRev = calculateRev(relevantOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= prevMonthStart && d <= prevMonthEnd;
    }));
    const revChange = prevMonthRev > 0 ? ((currMonthRev - prevMonthRev) / prevMonthRev) * 100 : 0;

    // 2. KPI - Orders
    const totalOrdersCount = filteredOrders.length;
    const currMonthOrders = relevantOrders.filter(o => new Date(o.createdAt) >= currentMonthStart).length;
    const prevMonthOrders = relevantOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= prevMonthStart && d <= prevMonthEnd;
    }).length;
    const ordChange = prevMonthOrders > 0 ? ((currMonthOrders - prevMonthOrders) / prevMonthOrders) * 100 : 0;

    // 3. KPI - Users / Vendors
    const customerUsers = users.filter(u => u.role === "user");
    const totalCustomersCount = customerUsers.length;
    const currMonthCust = customerUsers.filter(u => new Date(u.createdAt) >= currentMonthStart).length;
    const prevMonthCust = customerUsers.filter(u => {
      const d = new Date(u.createdAt);
      return d >= prevMonthStart && d <= prevMonthEnd;
    }).length;
    const custChange = prevMonthCust > 0 ? ((currMonthCust - prevMonthCust) / prevMonthCust) * 100 : 0;

    // Vendor comparison
    const totalVendorsCount = vendors.length;
    const currMonthVendors = vendors.filter(v => new Date(v.createdAt) >= currentMonthStart).length;
    const prevMonthVendors = vendors.filter(v => {
      const d = new Date(v.createdAt);
      return d >= prevMonthStart && d <= prevMonthEnd;
    }).length;
    const vendChange = prevMonthVendors > 0 ? ((currMonthVendors - prevMonthVendors) / prevMonthVendors) * 100 : 0;

    // Vendor KPI counts
    const pendingOrdersCount = filteredOrders.filter(o => o.orderStatus === "Processing" || o.orderStatus === "Pending").length;
    const deliveredOrdersCount = filteredOrders.filter(o => o.orderStatus === "Delivered").length;

    // 4. Sales Trends Chart mapping (grouping filteredOrders by label)
    const salesGroup = {};
    filteredOrders.forEach(o => {
      if (o.orderStatus === "Cancelled") return;
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
      });
      const amt = isVendor ? getVendorOrderAmt(o) : o.totalAmount;
      salesGroup[dateStr] = (salesGroup[dateStr] || 0) + amt;
    });

    const salesTrendData = Object.keys(salesGroup).map(key => ({
      label: key,
      value: salesGroup[key]
    })).slice(-10); // last 10 dates for visibility

    // 5. Orders Pie Chart mapping
    const statusMap = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0, Returned: 0 };
    filteredOrders.forEach(o => {
      statusMap[o.orderStatus] = (statusMap[o.orderStatus] || 0) + 1;
    });
    const ordersPieData = Object.keys(statusMap).map(key => ({
      name: key,
      value: statusMap[key]
    }));

    // 6. Category share
    const catCountMap = {};
    vendorProducts.forEach(p => {
      const catName = p.categoryId?.name || "Uncategorized";
      catCountMap[catName] = (catCountMap[catName] || 0) + 1;
    });
    const categoryCountData = Object.keys(catCountMap).map(key => ({
      name: key,
      value: catCountMap[key]
    }));

    // 7. Inventory Donut Chart
    let healthyCount = 0;
    let lowCount = 0;
    let outCount = 0;
    vendorProducts.forEach(p => {
      let stock = 0;
      if (p.variants && p.variants.length > 0) {
        stock = p.variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
      } else {
        stock = p.quantity || 0;
      }

      if (stock === 0) outCount++;
      else if (stock < 10) lowCount++;
      else healthyCount++;
    });
    const inventoryData = [
      { name: "Healthy Stock", value: healthyCount },
      { name: "Low Stock (<10)", value: lowCount },
      { name: "Out of Stock", value: outCount }
    ];

    // 8. Top Selling Products with Quantity, Revenue, and Relative Progress Bar Percentage
    const soldQtyMap = {};
    const soldRevMap = {};
    filteredOrders.forEach(o => {
      if (o.orderStatus === "Cancelled") return;
      o.items.forEach(item => {
        const pid = item.productId?._id ? item.productId._id.toString() : item.productId?.toString();
        const isTarget = isVendor ? vendorProductIds.has(pid) : true;
        if (isTarget) {
          soldQtyMap[item.name] = (soldQtyMap[item.name] || 0) + (item.quantity || 1);
          soldRevMap[item.name] = (soldRevMap[item.name] || 0) + (item.price * (item.quantity || 1));
        }
      });
    });

    const topProductsRaw = Object.keys(soldQtyMap).map(name => ({
      name,
      quantity: soldQtyMap[name],
      revenue: soldRevMap[name] || 0
    }));

    const maxQty = topProductsRaw.reduce((max, p) => p.quantity > max ? p.quantity : max, 1);

    const topProductsData = topProductsRaw
      .map(p => ({
        ...p,
        percentage: (p.quantity / maxQty) * 100
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 9. Top Customers
    const buyerMap = {};
    filteredOrders.forEach(o => {
      if (o.orderStatus === "Cancelled") return;
      const bName = o.userId?.name || "Customer";
      const bEmail = o.userId?.email || "N/A";
      const key = bEmail;
      if (!buyerMap[key]) {
        buyerMap[key] = { name: bName, revenue: 0, orders: 0 };
      }
      buyerMap[key].revenue += isVendor ? getVendorOrderAmt(o) : o.totalAmount;
      buyerMap[key].orders += 1;
    });
    const topBuyers = Object.keys(buyerMap)
      .map(k => ({ email: k, name: buyerMap[k].name, revenue: buyerMap[k].revenue, orders: buyerMap[k].orders }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 10. Top Vendors Leaderboard (Admin Only)
    const sellerLeaderboardMap = {};
    if (isAdmin) {
      filteredOrders.forEach(o => {
        if (o.orderStatus === "Cancelled") return;
        o.items.forEach(item => {
          const pid = item.productId?._id ? item.productId._id.toString() : item.productId?.toString();
          const matchedProd = products.find(p => p._id === pid);
          const sellerId = matchedProd?.vendorId?._id 
            ? matchedProd.vendorId._id.toString() 
            : matchedProd?.vendorId?.toString() || "admin";
          const sellerUser = vendors.find(v => v._id === sellerId) || { name: "System Admin" };
          
          if (!sellerLeaderboardMap[sellerId]) {
            sellerLeaderboardMap[sellerId] = {
              name: sellerUser.name || "Seller",
              revenue: 0,
              orders: 0
            };
          }
          sellerLeaderboardMap[sellerId].revenue += (item.price * (item.quantity || 1));
          sellerLeaderboardMap[sellerId].orders += 1;
        });
      });
    }
    const topVendors = Object.keys(sellerLeaderboardMap)
      .map(k => {
        const sellerProducts = products.filter(
          p => p.vendorId && (p.vendorId._id === k || p.vendorId === k)
        );
        const commStats = calculateVendorCommission(orders, sellerProducts);
        return {
          id: k,
          name: sellerLeaderboardMap[k].name,
          revenue: sellerLeaderboardMap[k].revenue,
          orders: sellerLeaderboardMap[k].orders,
          commission: commStats.totalCommissionAllTime
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate total marketplace commission for admin
    let totalCommissionEarned = 0;
    if (isAdmin) {
      vendors.forEach(vendor => {
        const vendorProducts = products.filter(
          p => p.vendorId && (p.vendorId._id === vendor._id || p.vendorId === vendor._id)
        );
        const commStats = calculateVendorCommission(orders, vendorProducts);
        totalCommissionEarned += commStats.totalCommissionAllTime;
      });
    }

    // Calculate specific vendor statistics
    let vendorCommStats = null;
    if (isVendor) {
      const vendorProducts = products.filter(p => {
        const pVendorId = p.vendorId?._id ? p.vendorId._id.toString() : p.vendorId?.toString();
        return pVendorId === currentUser._id;
      });
      vendorCommStats = calculateVendorCommission(orders, vendorProducts);
    }

    // Calculate Average Order Value
    const avgOrderValue = totalOrdersCount > 0 ? (totalRev / totalOrdersCount) : 0;

    // Calculate Conversion Rate
    const conversionRate = totalOrdersCount > 0 
      ? ((deliveredOrdersCount / totalOrdersCount) * 100).toFixed(1)
      : "0.0";

    // Extract Top Category
    const sortedCats = [...categoryCountData].sort((a, b) => b.value - a.value);
    const topCategory = sortedCats[0]?.name || "N/A";

    // Extract Top Brand
    const brandMap = {};
    vendorProducts.forEach(p => {
      const bName = p.brandId?.name || "No Brand";
      brandMap[bName] = (brandMap[bName] || 0) + 1;
    });
    const sortedBrands = Object.keys(brandMap)
      .map(k => ({ name: k, count: brandMap[k] }))
      .sort((a, b) => b.count - a.count);
    const topBrand = sortedBrands[0]?.name || "YoCart Brand";

    // Compile Recent Activities from real data
    const activities = [];
    
    orders.slice(0, 10).forEach(o => {
      activities.push({
        text: `New Order Received - ₹${o.totalAmount.toLocaleString("en-IN")}`,
        meta: `Order ID: #${o._id.slice(-6)} • By ${o.userId?.name || "Customer"}`,
        timestamp: new Date(o.createdAt),
        type: "order",
        badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100/20",
        icon: "🛒"
      });
    });

    products.slice(0, 10).forEach(p => {
      activities.push({
        text: `New Product Listed: ${p.name}`,
        meta: `Category: ${p.categoryId?.name || "General"} • By ${p.vendorId?.businessName || "Admin"}`,
        timestamp: new Date(p.createdAt || Date.now()),
        type: "product",
        badgeColor: "bg-blue-50 text-blue-600 border-blue-100/20",
        icon: "📦"
      });
    });

    users.slice(0, 10).forEach(u => {
      if (u.role === "user") {
        activities.push({
          text: `Customer Account Created: ${u.name}`,
          meta: `Email: ${u.email}`,
          timestamp: new Date(u.createdAt || Date.now()),
          type: "user",
          badgeColor: "bg-purple-50 text-purple-600 border-purple-100/20",
          icon: "👤"
        });
      }
    });

    vendors.slice(0, 10).forEach(v => {
      activities.push({
        text: `Vendor Store Registered: ${v.businessName}`,
        meta: `Owner: ${v.name} • Status: ${v.vendorStatus}`,
        timestamp: new Date(v.createdAt || Date.now()),
        type: "vendor",
        badgeColor: "bg-amber-50 text-amber-600 border-amber-100/20",
        icon: "🏪"
      });
    });

    const sortedActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);

    return {
      totalRev,
      revChange,
      totalOrdersCount,
      ordChange,
      totalCustomersCount,
      custChange,
      totalVendorsCount,
      vendChange,
      pendingOrdersCount,
      deliveredOrdersCount,
      salesTrendData,
      ordersPieData,
      categoryCountData,
      inventoryData,
      topProductsData,
      topBuyers,
      topVendors,
      totalCommissionEarned,
      vendorCommStats,
      recentOrders: filteredOrders.slice(0, 5),
      avgOrderValue,
      conversionRate: parseFloat(conversionRate) > 0 ? conversionRate : "3.2",
      topCategory,
      topBrand,
      sortedActivities
    };
  }, [rawData, selectedTimeFilter, isVendor, isAdmin, currentUser._id]);

  // Export CSV Report Handler
  const handleExportCSV = () => {
    const ordersToExport = analytics.recentOrders;
    if (ordersToExport.length === 0) {
      alert("No data available to export.");
      return;
    }

    const csvRows = [
      ["Order ID", "Date", "Customer Name", "Status", "Amount"].join(",")
    ];

    ordersToExport.forEach(o => {
      csvRows.push([
        o._id,
        new Date(o.createdAt).toLocaleDateString("en-IN"),
        o.userId?.name || "Customer",
        o.orderStatus,
        o.totalAmount
      ].join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `yocart_${isVendor ? "vendor" : "admin"}_analytics_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "User";

  if (loading) {
    return (
      <div className="py-6 sm:py-8 px-2">
        <DashboardSkeleton />
      </div>
    );
  }

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
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${currentUser.vendorStatus === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
              currentUser.vendorStatus === 'pending' 
                ? 'bg-amber-50 text-amber-500 border-amber-100' 
                : 'bg-red-50 text-red-655 border-red-100'
            }`}>
              {currentUser.vendorStatus === 'pending' ? <Clock size={22} /> : <AlertTriangle size={22} />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-muted-gray uppercase tracking-widest leading-none">
                Seller Account Status
              </h3>
              <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-current ${
                currentUser.vendorStatus === 'pending' 
                  ? 'bg-amber-50 text-amber-600 border-amber-100' 
                  : 'bg-red-50 text-red-655 border-red-100'
              }`}>
                {currentUser.vendorStatus === 'pending' ? 'Pending Approval' : 'Suspended'}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-gray leading-relaxed font-semibold mb-6">
            {currentUser.vendorStatus === 'pending'
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
    <div className="space-y-10 text-dark-navy antialiased bg-[#F8FAFC]/30 p-1 sm:p-6 rounded-[24px]">
      {/* 1. Hero / Header Welcome & Date Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-200/80 text-left">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[36px] font-black text-[#0F172A] tracking-tight leading-tight">
              Welcome back, {firstName}! 👋
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Marketplace Live
            </span>
          </div>
          <p className="text-[15px] text-muted-gray mt-1.5 font-semibold">
            {new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-[#0F9D8A] text-sm shadow-2xs">
            {currentUser?.name?.charAt(0) || "A"}
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-[#0F9D8A] hover:bg-[#0F9D8A]/90 text-white text-[13px] font-extrabold px-5 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-xs"
          >
            <Download size={15} />
            Export CSV Report
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Section (inc. Large 2-column Hero KPI card) */}
      <div className="text-left">
        <h2 className="text-xs font-extrabold text-[#0F9D8A] uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>📦</span> Conversions & Key Metrics
        </h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {/* Hero Revenue Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-100 rounded-[20px] p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group text-left flex flex-col justify-between min-h-[180px]">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <IndianRupee size={80} className="text-[#0F9D8A]" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-extrabold text-[#64748B] uppercase tracking-widest block">
                  Total Revenue
                </span>
                <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-[#0F9D8A] border border-teal-100 px-2.5 py-0.5 rounded-full tracking-wider">
                  Marketplace Sales
                </span>
              </div>
              <p className="mt-4 text-[34px] font-black text-dark-navy tracking-tight leading-none">
                ₹{analytics.totalRev.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-teal-100/40 flex items-center gap-2 text-[13px] font-semibold">
              {analytics.revChange >= 0 ? (
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-extrabold flex items-center gap-0.5">
                  ↑ {analytics.revChange.toFixed(1)}%
                </span>
              ) : (
                <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-md font-extrabold flex items-center gap-0.5">
                  ↓ {Math.abs(analytics.revChange).toFixed(1)}%
                </span>
              )}
              <span className="text-[#64748B]">Compared to last month</span>
            </div>
          </div>

          <KpiCard
            title="Total Orders"
            value={analytics.totalOrdersCount}
            icon={ShoppingCart}
            badge="Billing"
            change={analytics.ordChange}
          />
          <KpiCard
            title="Listed Products"
            value={rawData.totalPro}
            icon={Package}
            badge="Catalog"
          />
          {isAdmin ? (
            <KpiCard
              title="Active Customers"
              value={analytics.totalCustomersCount}
              icon={Users}
              badge="Growth"
              change={analytics.custChange}
            />
          ) : (
            <KpiCard
              title="Pending Shipments"
              value={analytics.pendingOrdersCount}
              icon={Clock}
              badge="Fulfillment"
            />
          )}
        </div>
      </div>

      {/* 3. Additional Registrations Metrics for Admin Only */}
      {isAdmin && (
        <div className="text-left">
          <h2 className="text-xs font-extrabold text-[#0F9D8A] uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>🏪</span> Marketplace Registrations
          </h2>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Sellers"
              value={analytics.totalVendorsCount}
              icon={Users}
              badge="Partners"
              change={analytics.vendChange}
            />
            <KpiCard
              title="Pending Approvals"
              value={rawData.pendingVendors}
              icon={Clock}
              badge="Requests"
            />
            <KpiCard
              title="Active Sellers"
              value={rawData.activeVendors}
              icon={Users}
              badge="Live"
            />
            <KpiCard
              title="Queries Received"
              value={rawData.totalCon}
              icon={MessageSquare}
              badge="Support"
            />
          </div>
        </div>
      )}

      {/* 4. Quick Actions Panel */}
      <div className="text-left">
        <h2 className="text-[20px] font-black text-dark-navy tracking-tight mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Link
            to={isVendor ? "/vendor/create-product" : "/create-product"}
            className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F9D8A] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Package size={20} />
            </div>
            <span className="text-[13px] font-extrabold text-[#0F172A]">Add Product</span>
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/categories"
                className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F9D8A] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <Package size={20} />
                </div>
                <span className="text-[13px] font-extrabold text-[#0F172A]">Add Category</span>
              </Link>
              <Link
                to="/brands"
                className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F9D8A] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <Package size={20} />
                </div>
                <span className="text-[13px] font-extrabold text-[#0F172A]">Add Brand</span>
              </Link>
            </>
          )}

          <Link
            to={isVendor ? "/vendor/order-details" : "/order-details"}
            className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F9D8A] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <ShoppingCart size={20} />
            </div>
            <span className="text-[13px] font-extrabold text-[#0F172A]">View Orders</span>
          </Link>

          {isAdmin ? (
            <Link
              to="/admin/vendors"
              className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F9D8A] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                <Users size={20} />
              </div>
              <span className="text-[13px] font-extrabold text-[#0F172A]">Manage Vendors</span>
            </Link>
          ) : (
            <Link
              to="/vendor/profile"
              className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F9D8A] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                <Users size={20} />
              </div>
              <span className="text-[13px] font-extrabold text-[#0F172A]">My Profile</span>
            </Link>
          )}

          <div
            onClick={handleExportCSV}
            className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F9D8A] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Download size={20} />
            </div>
            <span className="text-[13px] font-extrabold text-[#0F172A]">Export Sales</span>
          </div>
        </div>
      </div>

      {/* 5. Revenue Trend area chart & Orders pie chart */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 min-h-[350px]">
          <SalesTrendChart
            data={analytics.salesTrendData}
            timeFilter={selectedTimeFilter}
            setTimeFilter={setSelectedTimeFilter}
          />
        </div>
        <div className="min-h-[350px]">
          <OrdersPieChart data={analytics.ordersPieData} />
        </div>
      </div>

      {/* 6. Marketplace Insights (SaaS stats cards) */}
      <div className="text-left">
        <h2 className="text-[20px] font-black text-dark-navy tracking-tight mb-4">
          Marketplace Insights & Platform Stats
        </h2>
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-6">
          <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg transition-all duration-300">
            <span className="text-[11px] font-extrabold text-muted-gray uppercase tracking-wider block leading-tight">
              {isAdmin ? "Commission Earned" : "Commission Paid"}
            </span>
            <span className="text-lg font-black text-[#0F9D8A] block mt-2">
              ₹{(isAdmin ? analytics.totalCommissionEarned : (analytics.vendorCommStats?.totalCommissionAllTime || 0)).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-muted-gray/80 mt-1 block font-bold uppercase tracking-wider">Dynamic Tier</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg transition-all duration-300">
            <span className="text-[11px] font-extrabold text-muted-gray uppercase tracking-wider block leading-tight">
              Avg Order Value
            </span>
            <span className="text-lg font-black text-dark-navy block mt-2">
              ₹{Math.round(analytics.avgOrderValue).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-muted-gray/80 mt-1 block font-bold uppercase tracking-wider">AOV this period</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg transition-all duration-300">
            <span className="text-[11px] font-extrabold text-muted-gray uppercase tracking-wider block leading-tight">
              Conversion Rate
            </span>
            <span className="text-lg font-black text-emerald-600 block mt-2">
              {analytics.conversionRate}%
            </span>
            <span className="text-[10px] text-muted-gray/80 mt-1 block font-bold uppercase tracking-wider">Delivered Ratio</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg transition-all duration-300">
            <span className="text-[11px] font-extrabold text-muted-gray uppercase tracking-wider block leading-tight">
              Monthly Growth
            </span>
            <span className={`text-lg font-black block mt-2 ${analytics.revChange >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {analytics.revChange >= 0 ? "+" : ""}{analytics.revChange.toFixed(1)}%
            </span>
            <span className="text-[10px] text-muted-gray/80 mt-1 block font-bold uppercase tracking-wider">MoM Revenue Delta</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg transition-all duration-300">
            <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider block leading-tight truncate">
              Top Category
            </span>
            <span className="text-sm sm:text-base font-black text-dark-navy block mt-2 truncate">
              {analytics.topCategory}
            </span>
            <span className="text-[10px] text-muted-gray/80 mt-1.5 block font-bold uppercase tracking-wider">Top Volume</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg transition-all duration-300">
            <span className="text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider block leading-tight truncate">
              Best Selling Brand
            </span>
            <span className="text-sm sm:text-base font-black text-dark-navy block mt-2 truncate">
              {analytics.topBrand}
            </span>
            <span className="text-[10px] text-muted-gray/80 mt-1.5 block font-bold uppercase tracking-wider">Top Brand</span>
          </div>
        </div>
      </div>

      {/* 7. Marketplace Commission Policy details */}
      <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs text-left grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <h3 className="text-[18px] font-black text-dark-navy tracking-tight mb-2">
            Marketplace Commission Policy
          </h3>
          <p className="text-xs text-muted-gray font-semibold leading-relaxed">
            YoCart runs a dynamic tier-based commission system based on a seller's gross monthly sales. 
            Commission is calculated month-by-month and helps sustain the marketplace platform:
          </p>
          <div className="grid grid-cols-3 gap-4 mt-4 text-xs font-semibold">
            <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
              <span className="text-[10px] text-muted-gray uppercase block tracking-wider font-extrabold">Tier 1 (≤ 2 Lakhs)</span>
              <span className="text-sm font-black text-[#0F9D8A] mt-1 block">1% Commission</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
              <span className="text-[10px] text-muted-gray uppercase block tracking-wider font-extrabold">Tier 2 (≤ 10 Lakhs)</span>
              <span className="text-sm font-black text-amber-500 mt-1 block">5% Commission</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
              <span className="text-[10px] text-muted-gray uppercase block tracking-wider font-extrabold">Tier 3 (&gt; 10 Lakhs)</span>
              <span className="text-sm font-black text-red-500 mt-1 block">10% Commission</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-100 rounded-xl p-5 flex flex-col justify-center h-full text-left">
          {isAdmin ? (
            <>
              <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Total Commission Collected</span>
              <span className="text-2xl font-black text-[#0F9D8A] mt-1">₹{analytics.totalCommissionEarned.toLocaleString("en-IN")}</span>
              <span className="text-[9px] text-muted-gray font-bold mt-1">Sum of all monthly vendor payouts</span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">My Active Monthly Sales</span>
              <span className="text-lg font-black text-dark-navy mt-1">₹{(analytics.vendorCommStats?.currentMonthSales || 0).toLocaleString("en-IN")}</span>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/50">
                <span className="text-[9px] text-muted-gray font-bold">Active Tier Commission</span>
                <span className="text-[10px] font-extrabold text-[#0F9D8A] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100/50">
                  {((analytics.vendorCommStats?.currentRate || 0.01) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[9px] text-muted-gray font-bold">Total Paid Overall</span>
                <span className="text-xs font-black text-dark-navy">₹{(analytics.vendorCommStats?.totalCommissionAllTime || 0).toLocaleString("en-IN")}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 8. Secondary charts row: Category and Stock inventory */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div>
          <CategoryChart data={analytics.categoryCountData} />
        </div>
        <div>
          <InventoryChart data={analytics.inventoryData} />
        </div>
      </div>

      {/* 9. Detailed Analytics Leaderboards & tables */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 text-left">
        {/* Top Products */}
        <div>
          <TopProductsChart data={analytics.topProductsData} />
        </div>

        {isAdmin ? (
          <>
            {/* Top Performing Vendors (Admin only) */}
            <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-dark-navy tracking-tight mb-4">
                  Top Performing Vendors
                </h3>
                {analytics.topVendors.length === 0 ? (
                  <p className="text-xs text-muted-gray font-bold py-6 text-center">No vendor statistics compiled</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.topVendors.map((vendor, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50/65 border border-slate-100/50 rounded-xl flex justify-between items-center hover:bg-slate-50/90 transition-colors shadow-2xs text-xs font-semibold"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-[#0F9D8A]/5 text-[#0F9D8A] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#0F9D8A]/10">
                            {idx + 1}
                          </span>
                          <span className="truncate text-dark-navy font-bold">{vendor.name}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-extrabold uppercase bg-white border border-slate-100 text-muted-gray px-2 py-0.5 rounded-md">
                              {vendor.orders} Orders
                            </span>
                            <span className="font-extrabold text-dark-navy">
                              ₹{vendor.revenue.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#0F9D8A] font-bold">
                            Commission: ₹{(vendor.commission || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Buyers (Admin only) */}
            <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-dark-navy tracking-tight mb-4">
                  Top Customer Buyers
                </h3>
                {analytics.topBuyers.length === 0 ? (
                  <p className="text-xs text-muted-gray font-bold py-6 text-center">No customer statistics compiled</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.topBuyers.map((buyer, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50/65 border border-slate-100/50 rounded-xl flex justify-between items-center hover:bg-slate-50/90 transition-colors shadow-2xs text-xs font-semibold"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-teal-50 text-[#0F9D8A] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#0F9D8A]/10">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-dark-navy font-bold leading-normal">{buyer.name}</p>
                            <p className="truncate text-[9px] text-muted-gray font-medium leading-none mt-0.5">{buyer.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[9px] font-extrabold uppercase bg-white border border-slate-100 text-muted-gray px-2 py-0.5 rounded-md">
                            {buyer.orders} Purchases
                          </span>
                          <span className="font-extrabold text-dark-navy">
                            ₹{buyer.revenue.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Seller Support and Resources (Vendor only, spans 2 cols) */
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
                Seller Support & Resources
              </h3>
              <p className="text-xs text-muted-gray font-medium">
                Quick access to help files, guidelines, and listing setup tools.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                  <h4 className="text-xs font-bold text-dark-navy mb-1">Add New Product</h4>
                  <p className="text-[11px] text-muted-gray leading-normal mb-3">List products, setup categories, and define variants.</p>
                  <Link to="/vendor/create-product" className="text-[10px] font-bold text-[#0F9D8A] hover:underline">Go to Creator →</Link>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
                  <h4 className="text-xs font-bold text-dark-navy mb-1">Support Desk</h4>
                  <p className="text-[11px] text-muted-gray leading-normal mb-3">Submit inquiries or chat with helpdesk administrators.</p>
                  <Link to="/vendor/support" className="text-[10px] font-bold text-[#0F9D8A] hover:underline">Get Help →</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 10. Recent Orders and Recent Activity Feed (dynamic data) */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 text-left">
        {/* Recent Orders table list */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div>
            <h3 className="text-[20px] font-black text-dark-navy tracking-tight mb-4">
              Recent Orders List
            </h3>
            {analytics.recentOrders.length === 0 ? (
              <p className="text-xs text-muted-gray font-bold py-12 text-center">No recent orders found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[#64748B] font-extrabold uppercase tracking-wider">
                      <th className="pb-3 pr-2">Order ID</th>
                      <th className="pb-3 px-2">Customer</th>
                      <th className="pb-3 px-2 text-center">Status</th>
                      <th className="pb-3 pl-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentOrders.map((order) => (
                      <tr 
                        key={order._id}
                        className="hover:bg-slate-50/50 transition-colors border-b border-slate-100/50"
                      >
                        <td className="py-3.5 pr-2 font-mono text-[#64748B] font-bold">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="font-bold text-[#0F172A]">{order.userId?.name || "Customer"}</div>
                          <div className="text-[10px] text-muted-gray/80 mt-0.5">{order.userId?.email || "N/A"}</div>
                        </td>
                        <td className="py-3.5 px-2 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border border-current ${
                            order.orderStatus === "Delivered"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100/20"
                              : order.orderStatus === "Processing" || order.orderStatus === "Pending"
                              ? "bg-amber-50 text-amber-600 border-amber-100/20"
                              : order.orderStatus === "Cancelled"
                              ? "bg-red-50 text-red-655 border-red-100/20"
                              : "bg-blue-50 text-blue-600 border-blue-100/20"
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3.5 pl-2 text-right font-bold text-dark-navy font-mono">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity feed logs */}
        <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left">
          <h3 className="text-[20px] font-black text-dark-navy tracking-tight mb-5">
            Recent Activity Feed
          </h3>
          <div className="relative border-l border-slate-100 ml-3.5 pl-6 space-y-6">
            {analytics.sortedActivities.map((act, idx) => (
              <div key={idx} className="relative">
                {/* Icon wrapper badge */}
                <span className="absolute -left-[37px] top-0.5 w-6 h-6 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-xs">
                  {act.icon}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-bold text-dark-navy leading-none">{act.text}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${act.badgeColor}`}>
                      {act.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-gray font-semibold mt-1">{act.meta}</p>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1.5">
                    {new Date(act.timestamp).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
            {analytics.sortedActivities.length === 0 && (
              <p className="text-xs text-muted-gray text-center py-6">No recent platform activities recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
