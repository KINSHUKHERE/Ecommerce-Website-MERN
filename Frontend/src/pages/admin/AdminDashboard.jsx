import React, { useEffect, useState, useMemo } from "react";
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
      .map(k => ({
        id: k,
        name: sellerLeaderboardMap[k].name,
        revenue: sellerLeaderboardMap[k].revenue,
        orders: sellerLeaderboardMap[k].orders
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

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
      recentOrders: filteredOrders.slice(0, 5)
    };
  }, [rawData, selectedTimeFilter, isVendor, isAdmin]);

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
    <div className="space-y-8 text-dark-navy antialiased">
      {/* Header Panel */}
      <div className="mb-4 sm:mb-8 border-b border-light-border/40 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h1 className="text-xl sm:text-3xl font-extrabold text-dark-navy tracking-tight leading-tight">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-gray mt-1.5 font-semibold leading-relaxed">
            {isVendor 
              ? "Here's a comprehensive snapshot of your seller shop's performance, catalog overview, and product orders."
              : "Here's a comprehensive snapshot of your YoCart store's performance, catalog overview, and customer inquiries."}
          </p>
        </div>
        <div className="flex justify-start">
          <button
            onClick={handleExportCSV}
            className="bg-primary hover:bg-primary-hover text-white text-xs font-extrabold px-5 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Download size={14} />
            Export CSV Report
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="text-left">
        <h2 className="text-xs font-extrabold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>📦</span> Conversions & Key Metrics
        </h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Revenue"
            value={`₹${analytics.totalRev.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            icon={IndianRupee}
            badge="Sales"
            change={analytics.revChange}
          />
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

      {/* Additional Stats Row for Admins */}
      {isAdmin && (
        <div className="text-left pt-2">
          <h2 className="text-xs font-extrabold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>🏪</span> Marketplace Registrations
          </h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
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

      {/* Analytics Charts Grid */}
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

      {/* Secondary Chart Row: Categories and Stock */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div>
          <CategoryChart data={analytics.categoryCountData} />
        </div>
        <div>
          <InventoryChart data={analytics.inventoryData} />
        </div>
      </div>

      {/* Detailed Analytics Leaderboards and Tables */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 text-left">
        {/* Top Products */}
        <div className={isAdmin ? "lg:col-span-1" : "lg:col-span-1"}>
          <TopProductsChart data={analytics.topProductsData} />
        </div>

        {/* Quick Links / Admin Leaderboards Slot */}
        {isAdmin ? (
          <>
            {/* Top Sellers */}
            <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs h-full flex flex-col justify-between">
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
                        className="p-3 bg-slate-50/65 border border-slate-100/50 rounded-2xl flex justify-between items-center hover:bg-slate-50/90 transition-colors shadow-2xs text-xs font-semibold"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 border border-primary/10">
                            {idx + 1}
                          </span>
                          <span className="truncate text-dark-navy font-bold">{vendor.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[9px] font-extrabold uppercase bg-white border border-slate-100 text-muted-gray px-2 py-0.5 rounded-md">
                            {vendor.orders} Orders
                          </span>
                          <span className="font-extrabold text-dark-navy">
                            ₹{vendor.revenue.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Buyers */}
            <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs h-full flex flex-col justify-between">
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
                        className="p-3 bg-slate-50/65 border border-slate-100/50 rounded-2xl flex justify-between items-center hover:bg-slate-50/90 transition-colors shadow-2xs text-xs font-semibold"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-accent-light text-primary flex items-center justify-center font-bold text-[10px] shrink-0 border border-primary/10">
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
          <div className="lg:col-span-2 bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
                Seller Support & Resources
              </h3>
              <p className="text-xs text-muted-gray font-medium">
                Quick access to help files, guidelines, and listing setup tools.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-light-border/40">
                  <h4 className="text-xs font-bold text-dark-navy mb-1">Add New Product</h4>
                  <p className="text-[11px] text-muted-gray leading-normal mb-3">List products, setup categories, and define variants.</p>
                  <a href="/vendor/create-product" className="text-[10px] font-bold text-primary hover:underline">Go to Creator →</a>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-light-border/40">
                  <h4 className="text-xs font-bold text-dark-navy mb-1">Support Desk</h4>
                  <p className="text-[11px] text-muted-gray leading-normal mb-3">Submit inquiries or chat with helpdesk administrators.</p>
                  <a href="/vendor/support" className="text-[10px] font-bold text-primary hover:underline">Get Help →</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
