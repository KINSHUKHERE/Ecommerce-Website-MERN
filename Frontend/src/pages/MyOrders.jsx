import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { getUserOrders, cancelOrderApi, buyAgainApi } from "../api/OrderApi";
import { addReviewApi } from "../api/ReviewApi";
import {
  Loader2,
  Check,
  X,
  ShoppingBag,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Truck,
  Headphones,
  RotateCcw,
  FileText,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
  ChevronDown
} from "lucide-react";

// PackageIllustration matches mockup top-right graphics
const PackageIllustration = () => (
  <svg 
    className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-md select-none shrink-0" 
    viewBox="0 0 120 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Floating elements */}
    <path d="M10 25C15 20 22 25 25 30" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
    <path d="M110 85C105 90 98 85 95 80" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
    
    {/* 3D Box geometry */}
    <path d="M60 15L20 33L60 51L100 33L60 15Z" fill="#E0E7FF" stroke="#6366F1" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M20 33V78L60 96V51L20 33Z" fill="#C7D2FE" stroke="#6366F1" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M60 51V96L100 78V33L60 51Z" fill="#A5B4FC" stroke="#6366F1" strokeWidth="2.5" strokeLinejoin="round" />
    
    {/* Box details / Tape */}
    <path d="M60 24L38 32V38L60 30" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M60 24L82 32V38L60 30" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M60 51V76" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" />

    {/* Green active status bubble */}
    <circle cx="85" cy="55" r="14" fill="#10B981" className="shadow-sm" />
    <path d="M80 55L83.5 58.5L90.5 51.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ClipboardIllustration matches mockup empty state checklist graphics
const ClipboardIllustration = () => (
  <svg 
    className="w-20 h-20 sm:w-24 sm:h-24 text-primary/60 mx-auto select-none" 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Clipboard base */}
    <rect x="25" y="15" width="50" height="70" rx="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="3" />
    
    {/* Clamp */}
    <rect x="38" y="9" width="24" height="10" rx="4" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
    
    {/* Checklist lines */}
    <line x1="38" y1="36" x2="62" y2="36" stroke="#E2E8F0" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="38" y1="49" x2="62" y2="49" stroke="#E2E8F0" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="38" y1="62" x2="52" y2="62" stroke="#E2E8F0" strokeWidth="4.5" strokeLinecap="round" />
    
    {/* Magnifying Glass overlay */}
    <circle cx="65" cy="65" r="11" fill="white" stroke="#6366F1" strokeWidth="2.5" />
    <line x1="73" y1="73" x2="81" y2="81" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
    
    {/* Sparkles */}
    <path d="M15 45L17 47L15 49L13 47L15 45Z" fill="#38BDF8" />
    <path d="M85 30L86.5 31.5L85 33L83.5 31.5L85 30Z" fill="#38BDF8" />
  </svg>
);

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [userOrderStatusFilter, setUserOrderStatusFilter] = useState("All");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState("");
  const [reviewProductName, setReviewProductName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Cancellation states
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [cancelConfirmInput, setCancelConfirmInput] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Buy Again states
  const [buyAgainLoading, setBuyAgainLoading] = useState(false);
  const [buyAgainResult, setBuyAgainResult] = useState(null);
  const [showBuyAgainModal, setShowBuyAgainModal] = useState(false);

  // Toast states
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleBuyAgain = async (orderId) => {
    try {
      setBuyAgainLoading(true);
      const res = await buyAgainApi(orderId);
      setBuyAgainResult(res.data);
      setShowBuyAgainModal(true);
      window.dispatchEvent(new Event("cartUpdated"));
      
      // Dynamic summary toast
      const addText = res.data.addedCount === 1 ? "1 product added" : `${res.data.addedCount} products added`;
      const skipText = res.data.skippedCount === 1 ? "1 product skipped" : `${res.data.skippedCount} products skipped`;
      showToast(`${addText}. ${res.data.skippedCount > 0 ? skipText : ""}`);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Unable to process buy again reorder", "error");
    } finally {
      setBuyAgainLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async (selectedIdToPreserve = null) => {
    setLoadingOrders(true);
    try {
      const res = await getUserOrders();
      const list = res.data.orders || [];
      setOrders(list);
      if (selectedIdToPreserve) {
        const freshSelected = list.find((x) => x._id === selectedIdToPreserve);
        if (freshSelected) {
          setSelectedOrder(freshSelected);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Unable to fetch your order history", "error");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOpenReviewModal = (productId, productName) => {
    setReviewProductId(productId);
    setReviewProductName(productName);
    setReviewRating(5);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast("Please enter a review comment", "error");
      return;
    }
    if (reviewComment.length > 1000) {
      showToast("Review comment cannot exceed 1000 characters", "error");
      return;
    }
    setSubmittingReview(true);
    try {
      await addReviewApi(reviewProductId, Number(reviewRating), reviewComment);
      showToast("Review submitted successfully!", "success");
      setShowReviewModal(false);
      
      // Refresh orders list to reflect item as reviewed and retrieve rating/comment info
      fetchUserOrders(selectedOrder?._id);
    } catch (err) {
      console.error("Error submitting review", err);
      showToast(err.response?.data?.msg || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancelOrderClick = (orderId) => {
    setOrderToCancel(orderId);
    setCancelConfirmInput("");
    setShowCancelConfirmModal(true);
  };

  const executeCancelOrder = async () => {
    if (!orderToCancel) return;
    setCancellingOrderId(orderToCancel);
    try {
      await cancelOrderApi(orderToCancel);
      showToast("Order cancelled successfully", "success");
      
      // Update local state
      const updatedList = orders.map((o) => {
        if (o._id === orderToCancel) {
          return { ...o, orderStatus: "Cancelled" };
        }
        return o;
      });
      setOrders(updatedList);
      
      if (selectedOrder?._id === orderToCancel) {
        setSelectedOrder({ ...selectedOrder, orderStatus: "Cancelled" });
      }
      setShowCancelConfirmModal(false);
      setOrderToCancel(null);
    } catch (err) {
      console.error("Failed to cancel order", err);
      showToast(err.response?.data?.msg || "Failed to cancel order", "error");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getRatingColorClass = (rating) => {
    const r = Math.round(Number(rating));
    if (r >= 4) return "text-emerald-500";
    if (r === 3) return "text-amber-500";
    return "text-rose-500";
  };

  // Helper for status badge styles (Stripe / Shopify styled badges)
  const getStatusBadge = (status) => {
    switch (status) {
      case "Processing":
        return (
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 rounded-md select-none shrink-0">
            Processing
          </span>
        );
      case "Shipped":
        return (
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-md select-none shrink-0">
            Shipped
          </span>
        );
      case "Delivered":
        return (
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md select-none shrink-0">
            Delivered
          </span>
        );
      case "Cancelled":
        return (
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 rounded-md select-none shrink-0">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-100 rounded-md select-none shrink-0">
            {status}
          </span>
        );
    }
  };

  // Filter orders based on category pills and search inputs
  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      userOrderStatusFilter === "All" || order.orderStatus === userOrderStatusFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  // Calculate order counts for chips
  const countAll = orders.length;
  const countProcessing = orders.filter((o) => o.orderStatus === "Processing").length;
  const countShipped = orders.filter((o) => o.orderStatus === "Shipped").length;
  const countDelivered = orders.filter((o) => o.orderStatus === "Delivered").length;
  const countCancelled = orders.filter((o) => o.orderStatus === "Cancelled").length;

  return (
    <div className="flex-grow w-full bg-soft-bg/35 py-12 text-dark-navy antialiased min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Compact Title Header */}
        <div className="bg-white border border-light-border/40 rounded-[20px] px-5 py-4 shadow-xs flex flex-row items-center justify-between gap-4 relative overflow-hidden text-left">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
          <div className="flex items-center gap-3 pl-1">
            <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 text-primary rounded-xl flex items-center justify-center shadow-3xs shrink-0">
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base font-black text-dark-navy tracking-tight leading-none">My Orders</h1>
              <p className="text-[11px] text-muted-gray font-semibold mt-0.5">Track, manage and review your orders</p>
            </div>
          </div>
          <div className="hidden sm:block opacity-60 shrink-0">
            <PackageIllustration />
          </div>
        </div>

        {/* Main Grid Layout matching mockup (Left: Order history, Right: details / empty state) */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 items-start">
          
          {/* Order History Listing Panel */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white border border-light-border/50 rounded-[24px] p-5 sm:p-6 shadow-2xs space-y-5 text-left">
              
              <div className="flex justify-between items-center pb-2 border-b border-light-border/30">
                <h2 className="text-xs font-black text-muted-gray uppercase tracking-widest leading-none">
                  Order History
                </h2>
                <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                  {filteredOrders.length} {filteredOrders.length === 1 ? "Order" : "Orders"}
                </span>
              </div>

              {/* Advanced Search Filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Order ID or Item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 bg-slate-50/50 border border-light-border/60 hover:bg-slate-50 focus:bg-white rounded-xl text-xs font-semibold text-dark-navy focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none h-[38px] text-left"
                />
                <svg className="w-4 h-4 text-muted-gray absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray hover:text-dark-navy p-0.5 rounded-md hover:bg-slate-150 cursor-pointer"
                  >
                    <X size={12} className="stroke-[3]" />
                  </button>
                )}
              </div>

              {/* Responsive Category Filter Dropdown (Mobile) / Pills (Desktop) */}
              <div className="block sm:hidden relative">
                <button
                  type="button"
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="w-full pl-4 pr-10 py-2 bg-slate-50/50 border border-light-border/60 hover:bg-slate-50 focus:bg-white rounded-xl text-xs font-black uppercase tracking-wider text-dark-navy focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none cursor-pointer h-[38px] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {userOrderStatusFilter === "All" && <ShoppingBag className="w-3.5 h-3.5 text-primary" />}
                    {userOrderStatusFilter === "Processing" && <RotateCcw className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />}
                    {userOrderStatusFilter === "Shipped" && <Truck className="w-3.5 h-3.5 text-indigo-500" />}
                    {userOrderStatusFilter === "Delivered" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {userOrderStatusFilter === "Cancelled" && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                    {userOrderStatusFilter} Orders
                  </span>
                  <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${statusDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {statusDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setStatusDropdownOpen(false)}></div>
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-light-border/60 rounded-2xl shadow-lg p-1.5 z-55 animate-scaleUp">
                      {[
                        { key: "All", label: "All Orders", count: countAll, icon: ShoppingBag, color: "text-primary bg-indigo-50/50" },
                        { key: "Processing", label: "Processing", count: countProcessing, icon: RotateCcw, color: "text-amber-500 bg-amber-50/50" },
                        { key: "Shipped", label: "Shipped", count: countShipped, icon: Truck, color: "text-indigo-500 bg-indigo-50/50" },
                        { key: "Delivered", label: "Delivered", count: countDelivered, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50/50" },
                        { key: "Cancelled", label: "Cancelled", count: countCancelled, icon: AlertCircle, color: "text-rose-500 bg-rose-50/50" }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = userOrderStatusFilter === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              setUserOrderStatusFilter(item.key);
                              setStatusDropdownOpen(false);
                            }}
                            className={`group flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-all text-left ${
                              isSelected ? "bg-primary/5 text-primary font-black" : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${item.color} transition-all duration-200 group-hover:scale-105`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold transition-colors">
                                {item.label}
                              </span>
                            </span>
                            <span className="text-[10px] bg-slate-100/80 px-2 py-0.5 rounded-full font-extrabold text-muted-gray">
                              {item.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="hidden sm:flex gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
                {[
                  { key: "All", count: countAll },
                  { key: "Processing", count: countProcessing },
                  { key: "Shipped", count: countShipped },
                  { key: "Delivered", count: countDelivered },
                  { key: "Cancelled", count: countCancelled }
                ].map((chip) => {
                  const isActive = userOrderStatusFilter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => setUserOrderStatusFilter(chip.key)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer select-none ${
                        isActive
                          ? "bg-primary text-white border-primary shadow-xs scale-[1.02]"
                          : "bg-white text-muted-gray border-light-border/60 hover:bg-slate-50 hover:text-dark-navy"
                      }`}
                    >
                      {chip.key} ({chip.count})
                    </button>
                  );
                })}
              </div>

              {/* Order Cards List */}
              {loadingOrders ? (
                /* Sleek Loading Skeleton */
                <div className="space-y-3 py-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="border border-light-border/40 rounded-2xl p-4 bg-white animate-pulse space-y-3">
                      <div className="flex justify-between">
                        <div className="h-3.5 w-20 bg-slate-100 rounded"></div>
                        <div className="h-4.5 w-16 bg-slate-100 rounded-md"></div>
                      </div>
                      <div className="h-4.5 w-14 bg-slate-100 rounded"></div>
                      <div className="h-3 w-28 bg-slate-100 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center bg-slate-50/50 border border-dashed border-light-border/60 rounded-2xl p-4">
                  <ShoppingBag size={28} className="text-muted-gray/50 mb-2.5 animate-pulse" />
                  <h4 className="text-xs font-black text-dark-navy">No Orders Found</h4>
                  <p className="text-[10px] text-muted-gray mt-1 leading-normal font-semibold max-w-[180px]">
                    {searchQuery ? "Try altering your query parameters." : "Your purchase list is empty."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                  {filteredOrders.map((order) => {
                    const isSelected = selectedOrder?._id === order._id;
                    const firstItem = order.items?.[0] || {};
                    return (
                      <div
                        key={order._id}
                        onClick={() => setSelectedOrder(order)}
                        className={`border rounded-2xl p-3.5 cursor-pointer text-left transition-all duration-300 relative overflow-hidden group flex items-start gap-3.5 ${
                          isSelected
                            ? "bg-primary/5 border-primary shadow-3xs"
                            : "bg-white border-light-border/60 hover:bg-slate-50/60 hover:border-slate-300 hover:shadow-3xs hover:-translate-y-0.5"
                        }`}
                      >
                        {/* Image Preview Left */}
                        {firstItem.image && (
                          <img
                            src={firstItem.image}
                            alt={firstItem.name}
                            className="w-11 h-11 object-contain bg-slate-50 border border-light-border/40 rounded-xl p-0.5 flex-shrink-0"
                          />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1 gap-1">
                            <span className="text-[9px] font-black text-muted-gray font-mono truncate">
                              #{order._id.substring(18).toUpperCase()}
                            </span>
                            {getStatusBadge(order.orderStatus)}
                          </div>
                          
                          <p className="text-xs font-extrabold text-dark-navy mt-1">
                            ₹{order.totalAmount.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[9px] text-muted-gray font-bold mt-1">
                            Placed: {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </p>
                        </div>

                        {/* Chevron Indicator */}
                        <div className="self-center flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                          <ChevronRight size={14} className={isSelected ? "text-primary" : "text-muted-gray"} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total Summary Footer text */}
              <div className="pt-2 text-center text-[10px] text-muted-gray font-semibold">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>

            </div>
          </div>

          {/* Selected Order Details / Mockup Empty State */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedOrder ? (
              /* Premium Empty State matching mockup illustration */
              <div className="bg-white border border-light-border/50 rounded-[24px] p-8 sm:p-12 text-center shadow-2xs space-y-6 flex flex-col items-center justify-center">
                <div className="animate-pulse">
                  <ClipboardIllustration />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-base sm:text-lg font-black text-dark-navy uppercase tracking-tight">
                    Select an Order
                  </h3>
                  <p className="text-xs text-muted-gray leading-relaxed font-semibold">
                    Choose any order from the list to view detailed tracking, delivery location, items, payment info and more.
                  </p>
                </div>

                {/* Grid of trust markers at bottom from mockup */}
                <div className="w-full pt-8 border-t border-light-border/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <RotateCcw size={14} className="stroke-[2.5]" />
                      <h5 className="text-[10px] font-black uppercase tracking-wider">Easy Returns</h5>
                    </div>
                    <p className="text-[9px] text-muted-gray leading-normal font-semibold">Hassle-free returns within 7 days</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <ShieldCheck size={14} className="stroke-[2.5]" />
                      <h5 className="text-[10px] font-black uppercase tracking-wider">Secure Payments</h5>
                    </div>
                    <p className="text-[9px] text-muted-gray leading-normal font-semibold">100% secure payment gateway</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Truck size={14} className="stroke-[2.5]" />
                      <h5 className="text-[10px] font-black uppercase tracking-wider">Fast Delivery</h5>
                    </div>
                    <p className="text-[9px] text-muted-gray leading-normal font-semibold">Quick & reliable shipping</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Headphones size={14} className="stroke-[2.5]" />
                      <h5 className="text-[10px] font-black uppercase tracking-wider">24/7 Support</h5>
                    </div>
                    <p className="text-[9px] text-muted-gray leading-normal font-semibold">We're here to help you</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Details View */
              <div className="space-y-6">
                
                {/* Header details bar */}
                <div className="bg-white border border-light-border/50 rounded-[24px] p-5 shadow-2xs flex flex-wrap gap-4 items-center justify-between text-left">
                  <div>
                    <h3 className="text-xs font-black text-muted-gray uppercase tracking-widest">
                      Order Reference
                    </h3>
                    <p className="text-sm font-black font-mono text-dark-navy mt-1">
                      #{selectedOrder._id.toUpperCase()}
                    </p>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[9px] text-muted-gray font-bold block uppercase">Status</span>
                      <strong className="text-xs font-extrabold text-dark-navy block mt-0.5">
                        {selectedOrder.orderStatus}
                      </strong>
                    </div>
                    {getStatusBadge(selectedOrder.orderStatus)}
                  </div>
                </div>

                {/* Timeline Stepper */}
                <div className="bg-white border border-light-border/50 rounded-[24px] p-6 shadow-2xs space-y-4 text-left">
                  <h3 className="text-xs font-black text-muted-gray uppercase tracking-wider pb-3 border-b border-light-border/30 flex items-center gap-2">
                    <Truck size={14} className="text-primary" />
                    Tracking Milestones
                  </h3>

                  {selectedOrder.orderStatus === "Cancelled" ? (
                    <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-xs font-semibold">
                      <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="font-extrabold text-rose-800">Order Cancelled</p>
                        <p className="mt-1 leading-normal text-rose-600">This order transaction has been cancelled. If you already completed payment, a refund will be processed within 5-7 business days.</p>
                      </div>
                    </div>
                  ) : (
                    /* Visual Stepper steps matching mockup layout flow */
                    <div className="relative">
                      {/* Desktop Stepper */}
                      <div className="hidden sm:flex items-start justify-between gap-2 py-4 relative w-full">
                        {/* Connecting Line background */}
                        <div className="absolute top-[28px] left-[5%] right-[5%] h-[2px] bg-slate-100 z-0"></div>
                        
                        {[
                          { step: 1, label: "Order Placed", desc: "Confirmed", match: ["Processing", "Shipped", "Delivered"] },
                          { step: 2, label: "Processing", desc: "Packing & ready", match: ["Processing", "Shipped", "Delivered"] },
                          { step: 3, label: "Shipped", desc: "In transit", match: ["Shipped", "Delivered"] },
                          { step: 4, label: "Delivered", desc: "At your door", match: ["Delivered"] }
                        ].map((node) => {
                          const isDone = node.match.includes(selectedOrder.orderStatus);
                          const isActive = selectedOrder.orderStatus === node.label;
                          return (
                            <div key={node.step} className="flex flex-col items-center text-center z-10 flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                                isDone
                                  ? "bg-primary text-white border-primary shadow-xs"
                                  : "bg-white text-muted-gray border-slate-200"
                              }`}>
                                {isDone ? <Check size={14} className="stroke-[3]" /> : node.step}
                              </div>
                              <h4 className="text-[11px] font-black text-dark-navy mt-2.5 leading-none">
                                {node.label}
                              </h4>
                              <p className="text-[9px] text-muted-gray mt-1 font-bold">
                                {node.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile Vertical Stepper */}
                      <div className="sm:hidden flex flex-col gap-5 py-2 pl-3">
                        {[
                          { step: 1, label: "Order Placed", desc: "Confirmed", match: ["Processing", "Shipped", "Delivered"] },
                          { step: 2, label: "Processing", desc: "Packing & ready", match: ["Processing", "Shipped", "Delivered"] },
                          { step: 3, label: "Shipped", desc: "In transit", match: ["Shipped", "Delivered"] },
                          { step: 4, label: "Delivered", desc: "At your door", match: ["Delivered"] }
                        ].map((node, index, arr) => {
                          const isDone = node.match.includes(selectedOrder.orderStatus);
                          return (
                            <div key={node.step} className="flex items-start gap-4.5 relative">
                              {index < arr.length - 1 && (
                                <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-slate-100 -mb-6"></div>
                              )}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 z-10 ${
                                isDone
                                  ? "bg-primary text-white border-primary shadow-xs"
                                  : "bg-white text-muted-gray border-slate-200"
                              }`}>
                                {isDone ? <Check size={14} className="stroke-[3]" /> : node.step}
                              </div>
                              <div className="pt-0.5">
                                <h4 className="text-xs font-black text-dark-navy">
                                  {node.label}
                                </h4>
                                <p className="text-[10px] text-muted-gray mt-0.5 font-bold">
                                  {node.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Purchased List */}
                <div className="bg-white border border-light-border/50 rounded-[24px] p-6 shadow-2xs space-y-4 text-left">
                  <h3 className="text-xs font-black text-muted-gray uppercase tracking-wider pb-3 border-b border-light-border/30">
                    Items Purchased
                  </h3>
                  <div className="divide-y divide-light-border/20">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-3 py-4.5 first:pt-0 last:pb-0">
                        <Link
                          to={`/products/${item.productId}`}
                          className="flex gap-4 items-start group/item cursor-pointer"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 object-contain bg-slate-50 border border-light-border/40 p-1 rounded-xl flex-shrink-0 group-hover/item:border-primary/40 transition-colors"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-black text-dark-navy leading-snug truncate group-hover/item:text-primary transition-colors text-left">
                              {item.name}
                            </h4>
                            <div className="flex justify-between items-center mt-2 text-xs font-bold text-muted-gray">
                              <span>Qty: {item.quantity}</span>
                              <span className="font-extrabold text-dark-navy">₹{item.price.toLocaleString("en-IN")} each</span>
                            </div>
                          </div>
                        </Link>
                          
                          {/* Write Review Button */}
                          {selectedOrder.orderStatus === "Delivered" && (
                            <div className="flex justify-end mt-2 pt-2 border-t border-slate-50">
                              <button
                                type="button"
                                disabled={item.isReviewed}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReviewModal(item.productId, item.name);
                                }}
                                className={`px-3.5 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border cursor-pointer transition active:scale-95 flex items-center gap-1 ${
                                  item.isReviewed
                                    ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-indigo-50 hover:bg-indigo-100/70 border-indigo-100/50 text-indigo-650"
                                }`}
                              >
                                <span>{item.isReviewed ? "✓ Reviewed" : "✍️ Review Product"}</span>
                              </button>
                            </div>
                          )}

                          {/* Render user's review details if already reviewed */}
                          {item.isReviewed && (item.userRating || item.userComment) && (
                            <div className="mt-3 p-3 bg-slate-50 border border-slate-100/80 rounded-xl space-y-1.5 text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-dark-navy uppercase tracking-wider">My Review:</span>
                                <div className={`flex ${getRatingColorClass(item.userRating || 5)} text-[10px] gap-0.5`}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star}>
                                      {star <= (item.userRating || 5) ? "★" : "☆"}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-[9px] font-black text-dark-navy">({item.userRating || 5}/5)</span>
                              </div>
                              {item.userComment && (
                                <p className="text-[11px] text-muted-gray font-semibold italic leading-relaxed">
                                  "{item.userComment}"
                                </p>
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logistics Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                  
                  {/* Delivery Location Address Card */}
                  <div className="bg-white border border-light-border/50 rounded-[24px] p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-muted-gray font-black uppercase tracking-widest block">
                        Delivery Location
                      </span>
                      <div className="text-xs font-semibold text-muted-gray leading-normal space-y-1.5 mt-2.5">
                        <p className="font-black text-dark-navy flex items-center gap-1.5">
                          <MapPin size={12} className="text-primary" />
                          {selectedOrder.shippingAddress.address}
                        </p>
                        <p className="pl-3.5">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/5 text-primary border border-primary/10 tracking-wider">
                        {selectedOrder.shippingAddress.country}
                      </span>
                    </div>
                  </div>

                  {/* Payment Details Card */}
                  <div className="bg-white border border-light-border/50 rounded-[24px] p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-muted-gray font-black uppercase tracking-widest block">
                        Transaction Info
                      </span>
                      <div className="text-xs font-semibold text-muted-gray space-y-1.5 mt-2.5">
                        <p>Method: <strong className="text-dark-navy">{selectedOrder.paymentMethod}</strong></p>
                        <p>Txn ID: <strong className="font-mono text-dark-navy">{selectedOrder.transactionId}</strong></p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-light-border/20 flex justify-between items-center">
                      <span className="text-[9px] text-muted-gray font-bold uppercase">Subtotal</span>
                      <strong className="text-sm font-black text-primary">₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>

                </div>

                {/* Cancel Purchase Action */}
                {selectedOrder.orderStatus !== "Delivered" && selectedOrder.orderStatus !== "Cancelled" && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handleCancelOrderClick(selectedOrder._id)}
                      className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black uppercase tracking-wider rounded-xl border border-rose-150 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      Cancel Entire Purchase
                    </button>
                  </div>
                )}

                {/* Buy Again Action */}
                {selectedOrder.orderStatus === "Delivered" && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handleBuyAgain(selectedOrder._id)}
                      disabled={buyAgainLoading}
                      className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 disabled:bg-slate-50 disabled:text-slate-350 disabled:border-light-border text-xs font-black uppercase tracking-wider rounded-xl border border-emerald-150 transition cursor-pointer active:scale-95 flex items-center gap-1.5 outline-none focus:outline-none"
                    >
                      {buyAgainLoading ? (
                        <Loader2 size={13} className="animate-spin text-current" />
                      ) : (
                        <RotateCcw size={13} className="stroke-[2.5]" />
                      )}
                      <span>Buy Again</span>
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>

      {/* Review Submission Modal */}
      {showReviewModal && createPortal(
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-left space-y-4 relative animate-scaleUp">
            <button
              onClick={() => {
                setShowReviewModal(false);
                setReviewProductId("");
                setReviewProductName("");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-muted-gray transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <span className="text-[9px] bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-indigo-100/20">
                Write Product Review
              </span>
              <h3 className="text-sm font-extrabold text-dark-navy mt-2 leading-snug">
                {reviewProductName}
              </h3>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              {/* Rating Star Selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">
                  Your Rating
                </label>
                <div className="flex gap-1.5 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-xl font-bold cursor-pointer transition active:scale-90 outline-none border-none bg-transparent ${
                        star <= reviewRating ? getRatingColorClass(reviewRating) : "text-slate-200"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-[10px] font-bold text-muted-gray ml-1">
                    ({reviewRating} / 5 stars)
                  </span>
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">
                    Review Details
                  </label>
                  <span className={`text-[9px] font-bold ${reviewComment.length >= 950 ? "text-rose-500 font-extrabold" : "text-muted-gray"}`}>
                    {reviewComment.length} / 1000
                  </span>
                </div>
                <textarea
                  required
                  rows="3"
                  maxLength={1000}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full border border-light-border rounded-xl px-3 py-2 text-xs font-semibold text-dark-navy resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/5 transition-all bg-white"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewProductId("");
                    setReviewProductName("");
                  }}
                  className="px-4 py-2 border border-light-border hover:bg-slate-50 text-muted-gray text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submittingReview && <Loader2 size={12} className="animate-spin" />}
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Cancellation Confirmation Modal */}
      {showCancelConfirmModal && createPortal(
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-left space-y-4 relative animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center text-xl">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-extrabold text-dark-navy uppercase tracking-wider">
                Confirm Cancellation
              </h3>
              <p className="text-xs text-muted-gray mt-2 leading-relaxed font-semibold">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirmModal(false);
                  setOrderToCancel(null);
                }}
                className="px-4 py-2 border border-light-border hover:bg-slate-50 text-muted-gray text-xs font-bold rounded-xl transition cursor-pointer"
              >
                No, Keep
              </button>
              <button
                type="button"
                disabled={cancellingOrderId !== null}
                onClick={executeCancelOrder}
                className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md transition cursor-pointer ${
                  cancellingOrderId === null
                    ? "bg-red-500 hover:bg-red-650 text-white active:scale-95"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                }`}
              >
                {cancellingOrderId !== null ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Buy Again Confirmation Summary Modal */}
      {showBuyAgainModal && buyAgainResult && createPortal(
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 max-w-md w-full shadow-2xl text-left space-y-4 relative animate-scaleUp">
            <button
              onClick={() => setShowBuyAgainModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-muted-gray transition cursor-pointer outline-none focus:outline-none"
            >
              <X size={15} />
            </button>
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center">
                <Check size={18} className="stroke-[3]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-dark-navy uppercase tracking-wider">
                  Reorder Summary
                </h3>
                <p className="text-[10px] text-muted-gray font-bold uppercase tracking-widest mt-0.5">
                  Products processed from previous purchase
                </p>
              </div>
            </div>

            <div className="space-y-4 py-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {/* Added Products Section */}
              {buyAgainResult.added?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Added to Cart ({buyAgainResult.addedCount})
                  </h4>
                  <div className="space-y-1.5 pl-2.5">
                    {buyAgainResult.added.map((item, idx) => (
                      <div key={idx} className="text-xs font-semibold text-dark-navy flex flex-col">
                        <div className="flex justify-between">
                          <span className="truncate max-w-[280px]">✓ {item.name}</span>
                          <span className="text-muted-gray text-[11px] font-bold">Qty: {item.quantity}</span>
                        </div>
                        {item.isPartial && (
                          <span className="text-[9px] text-amber-600 font-extrabold uppercase mt-0.5 leading-none">
                            ⚠ Partial Fulfillment: {item.details}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skipped Products Section */}
              {buyAgainResult.skipped?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    Skipped Products ({buyAgainResult.skippedCount})
                  </h4>
                  <div className="space-y-1.5 pl-2.5">
                    {buyAgainResult.skipped.map((item, idx) => (
                      <div key={idx} className="text-xs font-semibold text-slate-500 flex justify-between items-start gap-2">
                        <span className="truncate max-w-[200px]">✕ {item.name}</span>
                        <span className="text-rose-500 text-[10px] font-bold uppercase whitespace-nowrap bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          {item.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBuyAgainModal(false)}
                className="px-4 py-2 border border-light-border hover:bg-slate-50 text-muted-gray text-xs font-bold rounded-xl transition cursor-pointer outline-none"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBuyAgainModal(false);
                  navigate("/cart");
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 cursor-pointer outline-none"
              >
                Go To Cart
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed bottom-5 right-5 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn max-w-[90vw] w-max">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0"></span>
          {message}
        </div>
      )}

    </div>
  );
};

export default MyOrders;
