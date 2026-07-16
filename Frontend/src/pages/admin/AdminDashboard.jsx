import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
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
import { getVendorWalletStatusApi, createVendorRechargeOrderApi, verifyVendorRechargePaymentApi, getCommissionSettingsApi, updateCommissionSettingsApi } from "../../api/PaymentApi";
import { Plus, Loader2, Settings, ShieldCheck } from "lucide-react";

// Import Reusable Dashboard Subcomponents
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";
import KpiCard from "../../components/dashboard/KpiCard";
import TopProductsChart from "../../components/dashboard/TopProductsChart";

// Lazy-loaded Charts
const SalesTrendChart = lazy(() => import("../../components/dashboard/SalesTrendChart"));
const OrdersPieChart = lazy(() => import("../../components/dashboard/OrdersPieChart"));
const CategoryChart = lazy(() => import("../../components/dashboard/CategoryChart"));
const InventoryChart = lazy(() => import("../../components/dashboard/InventoryChart"));

const ChartFallback = () => (
  <div className="h-[350px] flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100/50 animate-pulse text-xs font-semibold text-muted-gray w-full">
    <Loader2 className="animate-spin text-primary w-6 h-6 mb-2" />
    <span>Loading dashboard chart...</span>
  </div>
);

const LeaderboardSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-3 bg-slate-50/65 border border-slate-100/50 rounded-xl flex items-center justify-between animate-pulse h-[50px]">
        <div className="flex items-center gap-2.5 w-1/2">
          <span className="w-5 h-5 rounded-full bg-slate-200 shrink-0"></span>
          <div className="h-3.5 w-24 bg-slate-200 rounded"></div>
        </div>
        <div className="h-3.5 w-16 bg-slate-200 rounded"></div>
      </div>
    ))}
  </div>
);

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

  const [walletData, setWalletData] = useState({
    walletBalance: 0,
    lifetimeSales: 0,
    requiredMinBalance: 0,
    transactions: []
  });
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeLoading, setRechargeLoading] = useState(false);

  const [commissionSettings, setCommissionSettings] = useState({
    priceThreshold: 50000,
    commissionUnderThreshold: 2,
    commissionOverThreshold: 5,
  });

  const [settingsFormData, setSettingsFormData] = useState({
    priceThreshold: "50000",
    commissionUnderThreshold: "2",
    commissionOverThreshold: "5",
  });

  const currentUser = JSON.parse(localStorage.getItem("user")) || {
    name: "Admin",
    role: "admin"
  };

  const isVendor = currentUser.role === "vendor";
  const isAdmin = currentUser.role === "admin";
  const isVendorPendingOrSuspended = isVendor && currentUser.vendorStatus !== "active";

  const fetchWalletStatus = async () => {
    if (isVendor) {
      try {
        const res = await getVendorWalletStatusApi();
        setWalletData(res.data);
      } catch (err) {
        console.error("Failed to load wallet status", err);
      }
    }
  };

  const handleRechargeWallet = async () => {
    if (!rechargeAmount || rechargeAmount <= 0) {
      alert("Please enter a valid recharge amount");
      return;
    }
    setRechargeLoading(true);
    try {
      let orderData = null;
      try {
        const { data } = await createVendorRechargeOrderApi(Number(rechargeAmount));
        orderData = data;
      } catch (orderErr) {
        console.warn("Failed to create Razorpay order on backend, will offer simulation mode:", orderErr);
      }

      if (!orderData) {
        // Offer simulation flow if order API failed
        if (window.confirm("Razorpay API order creation failed. Would you like to simulate this recharge for testing/sandbox purposes?")) {
          setLoading(true);
          try {
            await verifyVendorRechargePaymentApi({
              razorpay_payment_id: "simulated_payment",
              razorpay_order_id: "simulated_order_" + Date.now(),
              razorpay_signature: "simulated_signature",
              amount: Number(rechargeAmount)
            });
            setShowRechargeModal(false);
            setRechargeAmount("");
            const updatedUser = {
              ...currentUser,
              walletBalance: (currentUser.walletBalance || 0) + Number(rechargeAmount)
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            await fetchWalletStatus();
            alert("Wallet recharged successfully (Simulated Sandbox)!");
          } catch (simErr) {
            console.error("Simulated recharge verification failed", simErr);
            alert(simErr.response?.data?.msg || "Failed to complete simulated recharge");
          } finally {
            setLoading(false);
            setRechargeLoading(false);
          }
          return;
        }
        setRechargeLoading(false);
        return;
      }
      
      // Load Razorpay SDK if not loaded
      await new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve();
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
        document.body.appendChild(script);
      });

      setRechargeLoading(false);

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "YoCart Vendor Wallet",
        description: "Recharge Prepaid Wallet",
        order_id: orderData.order_id,
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.phoneNumber || ""
        },
        theme: { color: "#088178" },
        handler: async (response) => {
          setLoading(true);
          try {
            await verifyVendorRechargePaymentApi({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: Number(rechargeAmount)
            });
            setShowRechargeModal(false);
            setRechargeAmount("");
            // Update local storage user just in case
            const updatedUser = {
              ...currentUser,
              walletBalance: (currentUser.walletBalance || 0) + Number(rechargeAmount)
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            // Refresh
            await fetchWalletStatus();
            alert("Wallet recharged successfully!");
          } catch (err) {
            console.error("Wallet recharge verification failed", err);
            alert(err.response?.data?.msg || "Wallet recharge verification failed");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setRechargeLoading(false);
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Wallet recharge failed", err);
      // Offer simulation flow if SDK loading fails or payment initiation fails
      if (window.confirm("Failed to load Razorpay payment gateway. Would you like to simulate this recharge for testing/sandbox purposes?")) {
        setLoading(true);
        try {
          await verifyVendorRechargePaymentApi({
            razorpay_payment_id: "simulated_payment",
            razorpay_order_id: "simulated_order_" + Date.now(),
            razorpay_signature: "simulated_signature",
            amount: Number(rechargeAmount)
          });
          setShowRechargeModal(false);
          setRechargeAmount("");
          const updatedUser = {
            ...currentUser,
            walletBalance: (currentUser.walletBalance || 0) + Number(rechargeAmount)
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          await fetchWalletStatus();
          alert("Wallet recharged successfully (Simulated Sandbox)!");
        } catch (simErr) {
          console.error("Simulated recharge verification failed", simErr);
          alert(simErr.response?.data?.msg || "Failed to complete simulated recharge");
        } finally {
          setLoading(false);
        }
      }
      setRechargeLoading(false);
    }
  };

  const fetchCommissionSettings = async () => {
    try {
      const res = await getCommissionSettingsApi();
      if (res.data) {
        setCommissionSettings(res.data);
        setSettingsFormData({
          priceThreshold: String(res.data.priceThreshold),
          commissionUnderThreshold: String(res.data.commissionUnderThreshold),
          commissionOverThreshold: String(res.data.commissionOverThreshold),
        });
      }
    } catch (err) {
      console.error("Failed to fetch commission settings:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData(currentUser, selectedTimeFilter);
      setRawData(data);
      await fetchWalletStatus();
      await fetchCommissionSettings();
    } catch (error) {
      console.error("Dashboard data load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCommissionSettings = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        priceThreshold: Number(settingsFormData.priceThreshold),
        commissionUnderThreshold: Number(settingsFormData.commissionUnderThreshold),
        commissionOverThreshold: Number(settingsFormData.commissionOverThreshold),
      };
      const res = await updateCommissionSettingsApi(payload);
      if (res.data) {
        setCommissionSettings({
          priceThreshold: payload.priceThreshold,
          commissionUnderThreshold: payload.commissionUnderThreshold,
          commissionOverThreshold: payload.commissionOverThreshold,
        });
        alert("Marketplace commission settings updated successfully!");
      }
    } catch (err) {
      console.error("Failed to update commission settings:", err);
      alert(err.response?.data?.msg || "Failed to update commission settings");
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTimeFilter]);

  // Compute all dashboard statistics in a single useMemo loop
  const analytics = useMemo(() => {
    return {
      totalRev: rawData.totalRevKPI || 0,
      prepaidRev: rawData.prepaidRev || 0,
      cashRev: rawData.cashRev || 0,
      revChange: rawData.revChange || 0,
      totalOrdersCount: rawData.totalOrdersCount || 0,
      ordChange: rawData.ordChange || 0,
      totalCustomersCount: rawData.totalCustomersCount || 0,
      custChange: rawData.custChange || 0,
      totalVendorsCount: rawData.totalVendorsCount || 0,
      vendChange: rawData.vendChange || 0,
      pendingOrdersCount: rawData.pendingOrdersCount || 0,
      deliveredOrdersCount: rawData.deliveredOrdersCount || 0,
      salesTrendData: rawData.salesTrendData || [],
      ordersPieData: rawData.ordersPieData || [],
      categoryCountData: rawData.categoryCountData || [],
      inventoryData: rawData.inventoryData || [],
      topProductsData: rawData.topProductsData || [],
      topBuyers: rawData.topBuyers || [],
      topVendors: rawData.topVendors || [],
      totalCommissionEarned: rawData.totalCommissionEarned || 0,
      vendorCommStats: rawData.vendorCommStats || null,
      recentOrders: rawData.recentOrders || [],
      avgOrderValue: rawData.avgOrderValue || 0,
      conversionRate: rawData.conversionRate || 3.2,
      topCategory: rawData.topCategory || "N/A",
      topBrand: rawData.topBrand || "N/A",
      sortedActivities: rawData.sortedActivities || []
    };
  }, [rawData]);

  const isVendorInsufficientBalance = isVendor && walletData.walletBalance < walletData.requiredMinBalance;

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

      {/* Commission Information Tagline (Vendor Only) */}
      {isVendor && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-left shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-650 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-widest mb-1">
              Marketplace Commission Policy
            </h4>
            <p className="text-[12px] text-indigo-950 font-semibold leading-relaxed">
              If the product price is less than <strong className="text-indigo-900">₹{(commissionSettings.priceThreshold || 50000).toLocaleString("en-IN")}</strong>, the admin will take a <strong className="text-indigo-900">{commissionSettings.commissionUnderThreshold || 2}%</strong> commission at the time of sale. If a customer pays via prepaid methods (Card/UPI/Razorpay), the {commissionSettings.commissionUnderThreshold || 2}% commission is auto-split directly to the admin and you receive the rest. For Cash on Delivery (COD) transactions, you collect the cash upon delivery, and the admin commission is auto-deducted directly from your prepaid wallet balance. For products priced at or above ₹{(commissionSettings.priceThreshold || 50000).toLocaleString("en-IN")}, the admin commission rate is <strong className="text-indigo-900">{commissionSettings.commissionOverThreshold || 5}%</strong>.
            </p>
          </div>
        </div>
      )}

      {/* 2. KPI Cards Section (inc. Large 2-column Hero KPI card) */}
      <div className="text-left">
        <h2 className="text-xs font-extrabold text-[#0F9D8A] uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>📦</span> Conversions & Key Metrics
        </h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {/* Hero Revenue Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-100 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group text-left flex flex-col justify-between min-h-[150px]">
            <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none transform rotate-12">
              <IndianRupee size={90} className="text-[#0F9D8A]" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-extrabold text-[#64748B] uppercase tracking-widest block">
                  Total Revenue
                </span>
                <span className="text-[9px] font-extrabold uppercase bg-teal-50 text-[#0F9D8A] border border-teal-100 px-2 py-0.5 rounded-full tracking-wider">
                  Marketplace Sales
                </span>
              </div>
              <p className="mt-1.5 text-xl sm:text-2xl font-black text-dark-navy tracking-tight leading-none">
                {loading ? (
                  <span className="inline-block h-7 w-32 bg-slate-200 rounded animate-pulse mt-1"></span>
                ) : (
                  `₹${analytics.totalRev.toLocaleString("en-IN")}`
                )}
              </p>

              {/* Cash vs Prepaid Breakdown */}
              <div className="mt-3 grid grid-cols-2 gap-4 border-t border-teal-100/40 pt-2 text-[10px] sm:text-[11px] font-semibold text-muted-gray">
                <div>
                  <span className="block text-[8px] uppercase tracking-widest text-[#64748B]">Prepaid Sales</span>
                  {loading ? (
                    <span className="inline-block h-4 w-16 bg-slate-200 rounded animate-pulse mt-0.5"></span>
                  ) : (
                    <span className="text-dark-navy font-bold text-xs">₹{analytics.prepaidRev.toLocaleString("en-IN")}</span>
                  )}
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-widest text-[#64748B]">Cash Sales (COD)</span>
                  {loading ? (
                    <span className="inline-block h-4 w-16 bg-slate-200 rounded animate-pulse mt-0.5"></span>
                  ) : (
                    <span className="text-dark-navy font-bold text-xs">₹{analytics.cashRev.toLocaleString("en-IN")}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-teal-100/40 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold">
              {loading ? (
                <span className="inline-block h-4 w-24 bg-slate-100 rounded animate-pulse"></span>
              ) : (
                <>
                  {analytics.revChange >= 0 ? (
                    <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5">
                      ↑ {analytics.revChange.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5">
                      ↓ {Math.abs(analytics.revChange).toFixed(1)}%
                    </span>
                  )}
                  <span className="text-muted-gray/80 font-bold">vs last month</span>
                </>
              )}
            </div>
          </div>

          {/* Wallet Status Card (Vendor Only) */}
          {!isAdmin && (
            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-100 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group text-left flex flex-col justify-between min-h-[150px]">
              <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none transform rotate-12">
                <IndianRupee size={90} className="text-indigo-650" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-extrabold text-[#64748B] uppercase tracking-widest block">
                    Wallet Balance
                  </span>
                  <button 
                    onClick={() => setShowRechargeModal(true)}
                    className="text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full tracking-wider hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors"
                  >
                    + Top Up
                  </button>
                </div>
                <p className="mt-1.5 text-xl sm:text-2xl font-black text-dark-navy tracking-tight leading-none">
                  {loading ? (
                    <span className="inline-block h-7 w-24 bg-slate-200 rounded animate-pulse mt-1"></span>
                  ) : (
                    `₹${(walletData.walletBalance || 0).toLocaleString("en-IN")}`
                  )}
                </p>
                <div className="mt-2 text-[10px] text-muted-gray font-semibold">
                  Required Minimum:{" "}
                  {loading ? (
                    <span className="inline-block h-3.5 w-12 bg-slate-200 rounded animate-pulse align-middle"></span>
                  ) : (
                    <span className="font-extrabold text-dark-navy">₹{(walletData.requiredMinBalance || 0).toLocaleString("en-IN")}</span>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-indigo-100/40 text-[10px] sm:text-[11px] font-semibold text-[#64748B]">
                {loading ? (
                  <span className="inline-block h-3.5 w-32 bg-slate-100 rounded animate-pulse"></span>
                ) : walletData.walletBalance < walletData.requiredMinBalance ? (
                  <span className="text-red-500 font-bold">⚠️ Insufficient Wallet Balance</span>
                ) : (
                  <span className="text-emerald-600 font-bold">✓ Wallet Status Healthy</span>
                )}
              </div>
            </div>
          )}

          <KpiCard
            title="Total Orders"
            value={analytics.totalOrdersCount}
            icon={ShoppingCart}
            badge="Billing"
            change={analytics.ordChange}
            loading={loading}
          />
          <KpiCard
            title="Listed Products"
            value={rawData.totalPro}
            icon={Package}
            badge="Catalog"
            loading={loading}
          />
          {isAdmin ? (
            <KpiCard
              title="Active Customers"
              value={analytics.totalCustomersCount}
              icon={Users}
              badge="Growth"
              change={analytics.custChange}
              loading={loading}
            />
          ) : (
            <KpiCard
              title="Pending Shipments"
              value={analytics.pendingOrdersCount}
              icon={Clock}
              badge="Fulfillment"
              loading={loading}
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
              loading={loading}
            />
            <KpiCard
              title="Pending Approvals"
              value={rawData.pendingVendors}
              icon={Clock}
              badge="Requests"
              loading={loading}
            />
            <KpiCard
              title="Active Sellers"
              value={rawData.activeVendors}
              icon={Users}
              badge="Live"
              loading={loading}
            />
            <KpiCard
              title="Queries Received"
              value={rawData.totalCon}
              icon={MessageSquare}
              badge="Support"
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Marketplace Commission Settings (Admin Only) */}
      {isAdmin && (
        <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs text-left mb-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F9D8A]">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-dark-navy uppercase tracking-widest">
                Marketplace Commission Rules Config
              </h3>
              <p className="text-xs text-muted-gray font-semibold mt-0.5">
                Configure global price-range threshold and commission percentage parameters.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCommissionSettings} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="priceThreshold" className="block mb-1.5 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">
                Price Threshold (₹)
              </label>
              <input
                id="priceThreshold"
                type="number"
                value={settingsFormData.priceThreshold}
                onChange={(e) => setSettingsFormData(prev => ({ ...prev, priceThreshold: e.target.value }))}
                className="w-full px-3.5 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-bold text-dark-navy bg-white"
                required
              />
            </div>
            <div>
              <label htmlFor="commissionUnderThreshold" className="block mb-1.5 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">
                Under Threshold Rate (%)
              </label>
              <input
                id="commissionUnderThreshold"
                type="number"
                value={settingsFormData.commissionUnderThreshold}
                onChange={(e) => setSettingsFormData(prev => ({ ...prev, commissionUnderThreshold: e.target.value }))}
                className="w-full px-3.5 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-bold text-dark-navy bg-white"
                required
              />
            </div>
            <div>
              <label htmlFor="commissionOverThreshold" className="block mb-1.5 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">
                At/Over Threshold Rate (%)
              </label>
              <input
                id="commissionOverThreshold"
                type="number"
                value={settingsFormData.commissionOverThreshold}
                onChange={(e) => setSettingsFormData(prev => ({ ...prev, commissionOverThreshold: e.target.value }))}
                className="w-full px-3.5 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-bold text-dark-navy bg-white"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-[#0F9D8A] hover:bg-[#0F9D8A]/90 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition shadow-xs uppercase tracking-wider h-[38px] active:scale-95 flex items-center justify-center"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Quick Actions Panel */}
      <div className="text-left">
        <h2 className="text-[20px] font-black text-dark-navy tracking-tight mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {isVendorInsufficientBalance ? (
            <button
              onClick={() => alert(`Insufficient wallet balance. You need to maintain a flat minimum balance of ₹200. Your current balance is ₹${walletData.walletBalance.toLocaleString("en-IN")}. Please recharge your wallet first.`)}
              className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer w-full text-left"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform mb-2 mx-auto">
                <Package size={20} />
              </div>
              <span className="text-[13px] font-extrabold text-red-500 mx-auto">Add Product</span>
            </button>
          ) : (
            <Link
              to={isVendor ? "/vendor/create-product" : "/create-product"}
              className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F9D8A] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                <Package size={20} />
              </div>
              <span className="text-[13px] font-extrabold text-[#0F172A]">Add Product</span>
            </Link>
          )}

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

          <button
            type="button"
            onClick={handleExportCSV}
            aria-label="Export Sales data to CSV"
            className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center group cursor-pointer w-full"
          >
            <div className="w-10 h-10 rounded-full bg-teal-50 text-[#0F9D8A] flex items-center justify-center group-hover:scale-110 transition-transform mb-2 mx-auto">
              <Download size={20} />
            </div>
            <span className="text-[13px] font-extrabold text-[#0F172A]">Export Sales</span>
          </button>
        </div>
      </div>

      {/* 5. Revenue Trend area chart & Orders pie chart */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 min-h-[350px]">
          <Suspense fallback={<ChartFallback />}>
            {loading ? (
              <ChartFallback />
            ) : (
              <SalesTrendChart
                data={analytics.salesTrendData}
                timeFilter={selectedTimeFilter}
                setTimeFilter={setSelectedTimeFilter}
              />
            )}
          </Suspense>
        </div>
        <div className="min-h-[350px]">
          <Suspense fallback={<ChartFallback />}>
            {loading ? <ChartFallback /> : <OrdersPieChart data={analytics.ordersPieData} />}
          </Suspense>
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
              {loading ? (
                <span className="inline-block h-5 w-20 bg-slate-200 rounded animate-pulse mt-0.5"></span>
              ) : (
                `₹${(isAdmin ? analytics.totalCommissionEarned : (analytics.vendorCommStats?.totalCommissionAllTime || 0)).toLocaleString("en-IN")}`
              )}
            </span>
            <span className="text-[10px] text-muted-gray/80 mt-1 block font-bold uppercase tracking-wider">Dynamic Tier</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg transition-all duration-300">
            <span className="text-[11px] font-extrabold text-muted-gray uppercase tracking-wider block leading-tight">
              Avg Order Value
            </span>
            <span className="text-lg font-black text-dark-navy block mt-2">
              {loading ? (
                <span className="inline-block h-5 w-20 bg-slate-200 rounded animate-pulse mt-0.5"></span>
              ) : (
                `₹${Math.round(analytics.avgOrderValue).toLocaleString("en-IN")}`
              )}
            </span>
            <span className="text-[10px] text-muted-gray/80 mt-1 block font-bold uppercase tracking-wider">AOV this period</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg transition-all duration-300">
            <span className="text-[11px] font-extrabold text-muted-gray uppercase tracking-wider block leading-tight">
              Conversion Rate
            </span>
            <span className="text-lg font-black text-emerald-600 block mt-2">
              {loading ? (
                <span className="inline-block h-5 w-16 bg-slate-200 rounded animate-pulse mt-0.5"></span>
              ) : (
                `${analytics.conversionRate}%`
              )}
            </span>
            <span className="text-[10px] text-muted-gray/80 mt-1 block font-bold uppercase tracking-wider">Delivered Ratio</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg transition-all duration-300">
            <span className="text-[11px] font-extrabold text-muted-gray uppercase tracking-wider block leading-tight">
              Monthly Growth
            </span>
            {loading ? (
              <span className="inline-block h-5 w-16 bg-slate-200 rounded animate-pulse mt-2.5"></span>
            ) : (
              <span className={`text-lg font-black block mt-2 ${analytics.revChange >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {analytics.revChange >= 0 ? "+" : ""}{analytics.revChange.toFixed(1)}%
              </span>
            )}
            <span className="text-[10px] text-muted-gray/80 mt-1 block font-bold uppercase tracking-wider">MoM Revenue Delta</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg transition-all duration-300">
            <span className="text-[11px] font-extrabold text-[#475569] uppercase tracking-wider block leading-tight truncate">
              Top Category
            </span>
            <span className="text-sm sm:text-base font-black text-dark-navy block mt-2 truncate">
              {loading ? (
                <span className="inline-block h-5 w-20 bg-slate-200 rounded animate-pulse mt-0.5"></span>
              ) : (
                analytics.topCategory
              )}
            </span>
            <span className="text-[10px] text-muted-gray/80 mt-1.5 block font-bold uppercase tracking-wider">Top Volume</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-[20px] p-5 shadow-2xs hover:shadow-lg transition-all duration-300">
            <span className="text-[11px] font-extrabold text-[#475569] uppercase tracking-wider block leading-tight truncate">
              Best Selling Brand
            </span>
            <span className="text-sm sm:text-base font-black text-dark-navy block mt-2 truncate">
              {loading ? (
                <span className="inline-block h-5 w-20 bg-slate-200 rounded animate-pulse mt-0.5"></span>
              ) : (
                analytics.topBrand
              )}
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
            YoCart runs a category-based commission system. Commission percentage is specified for each product category (e.g. Electronics, Clothing) and is auto-deducted directly from the vendor's Prepaid Wallet balance upon order delivery of COD orders.
          </p>
          <p className="text-xs text-muted-gray font-semibold leading-relaxed mt-2">
            Please make sure that vendors maintain their required minimum balance based on lifetime sales to keep their product listing active.
          </p>
        </div>
        <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border border-teal-100 rounded-xl p-5 flex flex-col justify-center h-full text-left">
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-3 w-32 bg-slate-200 rounded"></div>
              <div className="h-6 w-24 bg-slate-200 rounded"></div>
              <div className="h-2 w-28 bg-slate-100 rounded"></div>
            </div>
          ) : isAdmin ? (
            <>
              <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Total Commission Collected</span>
              <span className="text-2xl font-black text-[#0F9D8A] mt-1">₹{analytics.totalCommissionEarned.toLocaleString("en-IN")}</span>
              <span className="text-[9px] text-muted-gray font-bold mt-1">Sum of all vendor category-based payouts</span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">My Total Wallet Commission Paid</span>
              <span className="text-2xl font-black text-indigo-600 mt-1">₹{(analytics.vendorCommStats?.totalCommissionAllTime || 0).toLocaleString("en-IN")}</span>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/50">
                <span className="text-[9px] text-muted-gray font-bold">Total Sales Volume</span>
                <span className="text-xs font-black text-dark-navy">₹{(analytics.vendorCommStats?.totalSalesAllTime || 0).toLocaleString("en-IN")}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 8. Secondary charts row: Category and Stock inventory */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div>
          <Suspense fallback={<ChartFallback />}>
            {loading ? <ChartFallback /> : <CategoryChart data={analytics.categoryCountData} />}
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<ChartFallback />}>
            {loading ? <ChartFallback /> : <InventoryChart data={analytics.inventoryData} />}
          </Suspense>
        </div>
      </div>

      {/* 9. Detailed Analytics Leaderboards & tables */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 text-left">
        {/* Top Products */}
        <div>
          {loading ? (
            <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs h-full flex flex-col justify-between">
              <div>
                <div className="h-4 w-36 bg-slate-200 rounded mb-1"></div>
                <div className="h-3 w-56 bg-slate-100 rounded mb-5"></div>
              </div>
              <LeaderboardSkeleton />
            </div>
          ) : (
            <TopProductsChart data={analytics.topProductsData} />
          )}
        </div>

        {isAdmin ? (
          <>
            {/* Top Performing Vendors (Admin only) */}
            <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-dark-navy tracking-tight mb-4">
                  Top Performing Vendors
                </h3>
                {loading ? (
                  <LeaderboardSkeleton />
                ) : analytics.topVendors.length === 0 ? (
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
                {loading ? (
                  <LeaderboardSkeleton />
                ) : analytics.topBuyers.length === 0 ? (
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
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse w-full"></div>
                ))}
              </div>
            ) : analytics.recentOrders.length === 0 ? (
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
            {loading ? (
              <div className="space-y-4 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                    <div className="space-y-1.5 w-full">
                      <div className="h-3.5 w-3/4 bg-slate-200 rounded"></div>
                      <div className="h-2.5 w-1/2 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* 11. Vendor Wallet Transactions Section */}
      {isVendor && (
        <div className="bg-white border border-slate-200/80 rounded-[20px] p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left mt-6">
          <h3 className="text-[20px] font-black text-dark-navy tracking-tight mb-4">
            Prepaid Wallet Transaction History
          </h3>
          {walletData.transactions.length === 0 ? (
            <p className="text-xs text-muted-gray py-6 text-center font-bold">No transaction records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[#64748B] font-extrabold uppercase tracking-wider">
                    <th className="pb-3 pr-2">Date</th>
                    <th className="pb-3 px-2">Type</th>
                    <th className="pb-3 px-2">Description</th>
                    <th className="pb-3 pl-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {walletData.transactions.map((txn) => (
                    <tr 
                      key={txn._id}
                      className="hover:bg-slate-50/50 transition-colors border-b border-slate-100/50"
                    >
                      <td className="py-3.5 pr-2 text-muted-gray font-bold">
                        {new Date(txn.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border border-current ${
                          txn.type === "deposit"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100/20"
                            : "bg-red-50 text-red-655 border-red-100/20"
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 font-bold text-dark-navy">
                        {txn.description}
                      </td>
                      <td className={`py-3.5 pl-2 text-right font-black font-mono ${
                        txn.type === "deposit" ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {txn.type === "deposit" ? "+" : "-"}₹{txn.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Insufficient Wallet Warning Banner (Rendered at bottom to prevent CLS shift of above-the-fold content) */}
      {isVendorInsufficientBalance && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-5 sm:p-6 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn mt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-red-655 uppercase tracking-widest leading-none mb-1.5">
                Listing & Selling Locked: Insufficient Balance
              </h3>
              <p className="text-xs text-muted-gray leading-relaxed font-semibold">
                Your prepaid wallet balance of <strong className="text-dark-navy">₹{(walletData.walletBalance || 0).toLocaleString("en-IN")}</strong> is below the minimum required balance of <strong className="text-dark-navy">₹{(walletData.requiredMinBalance || 0).toLocaleString("en-IN")}</strong>. Recharge to unlock product creation.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRechargeModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer transition shrink-0 flex items-center justify-center gap-1.5 shadow-md"
          >
            + Recharge Wallet
          </button>
        </div>
      )}

      {/* WALLET RECHARGE MODAL */}
      {showRechargeModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-light-border rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-4 animate-scaleUp text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Plus size={22} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-dark-navy">Recharge Prepaid Wallet</h3>
              <p className="text-xs text-muted-gray mt-2 leading-relaxed font-semibold">
                Enter the amount you wish to recharge. Once complete, your store balance will be updated instantly.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="walletRechargeAmount" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest block">Recharge Amount (₹)</label>
              <input
                id="walletRechargeAmount"
                type="number"
                placeholder="Enter amount (e.g. 500)"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                disabled={rechargeLoading}
                className="w-full p-3 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-semibold text-dark-navy bg-white"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRechargeModal(false);
                  setRechargeAmount("");
                }}
                disabled={rechargeLoading}
                className="flex-1 py-2.5 border border-light-border text-muted-gray hover:bg-slate-50 font-bold text-xs rounded-xl transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRechargeWallet}
                disabled={rechargeLoading || !rechargeAmount}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                {rechargeLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Pay & Recharge</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminDashboard;
