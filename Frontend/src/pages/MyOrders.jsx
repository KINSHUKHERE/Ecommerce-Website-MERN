import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { getUserOrders, cancelOrderApi } from "../api/OrderApi";
import { addReviewApi } from "../api/ReviewApi";
import {
  Loader2,
  Check,
  X,
  ShoppingBag,
  Calendar,
  MapPin,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [userOrderStatusFilter, setUserOrderStatusFilter] = useState("All");
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

  // Toast states
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => setMessage(""), 2500);
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await getUserOrders();
      setOrders(res.data.orders || []);
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
    setSubmittingReview(true);
    try {
      await addReviewApi(reviewProductId, Number(reviewRating), reviewComment);
      showToast("Review submitted successfully!", "success");
      setShowReviewModal(false);
      // Refresh orders list to reflect item as reviewed
      fetchUserOrders();
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
      fetchUserOrders();
      setShowCancelConfirmModal(false);
      setOrderToCancel(null);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to cancel order", err);
      showToast(err.response?.data?.msg || "Failed to cancel order", "error");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getOrderStatusClass = (status) => {
    switch (status) {
      case "Processing":
        return "bg-amber-50 border-amber-100 text-amber-600";
      case "Shipped":
        return "bg-blue-50 border-blue-100 text-blue-600";
      case "Delivered":
        return "bg-emerald-50 border-emerald-100 text-emerald-600";
      case "Cancelled":
        return "bg-rose-50 border-rose-100 text-rose-600";
      default:
        return "bg-slate-50 border-slate-100 text-muted-gray";
    }
  };

  return (
    <div className="flex-grow w-full bg-soft-bg/30 py-12 text-dark-navy antialiased">
      <div className="max-w-5xl mx-auto px-6 space-y-6">
        
        {/* Title Header */}
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-navy tracking-tight leading-normal">
            My Orders
          </h1>
          <p className="text-xs text-muted-gray mt-1 font-semibold">
            Manage your purchases, inspect tracking milestones, and leave product reviews.
          </p>
        </div>

        {/* Outer Grid Panel */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 items-start">
          
          {/* Orders History List (Left Column) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-dark-navy uppercase tracking-wider pb-2 border-b border-light-border/40 text-left">
                Order History
              </h3>

              {/* Status pills filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => {
                  const isActive = userOrderStatusFilter === status;
                  const count = status === "All"
                    ? orders.length
                    : orders.filter(o => o.orderStatus === status).length;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setUserOrderStatusFilter(status)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition border cursor-pointer ${
                        isActive
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 text-muted-gray border-light-border/40 hover:text-dark-navy"
                      }`}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>

              {loadingOrders ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-primary w-6 h-6 mb-2" />
                  <span className="text-[10px] text-muted-gray font-extrabold uppercase tracking-wider">
                    Loading...
                  </span>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center">
                  <ShoppingBag size={32} className="text-muted-gray/50 mb-3" />
                  <h4 className="text-xs font-extrabold text-dark-navy">No Orders Found</h4>
                  <p className="text-[10px] text-muted-gray mt-1 leading-normal font-semibold">
                    You have not placed any orders yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {orders
                    .filter(o => userOrderStatusFilter === "All" || o.orderStatus === userOrderStatusFilter)
                    .map((order) => {
                      const isSelected = selectedOrder?._id === order._id;
                      return (
                        <div
                          key={order._id}
                          onClick={() => setSelectedOrder(order)}
                          className={`border rounded-2xl p-4 cursor-pointer text-left transition-all relative overflow-hidden ${
                            isSelected
                              ? "bg-primary/5 border-primary shadow-xs"
                              : "bg-slate-50/50 border-light-border hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-extrabold text-muted-gray font-mono">
                              #{order._id.substring(18)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getOrderStatusClass(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          
                          <p className="text-xs font-black text-dark-navy">
                            ₹{order.totalAmount.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[9px] text-muted-gray font-bold mt-1">
                            Placed: {new Date(order.createdAt).toLocaleDateString("en-IN")}
                          </p>
                          <div className="flex justify-end mt-1.5">
                            <ChevronRight size={14} className={isSelected ? "text-primary" : "text-muted-gray"} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

            </div>
          </div>

          {/* Selected Order Details (Right 2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedOrder ? (
              <div className="bg-white border border-light-border/60 rounded-3xl p-12 text-center shadow-2xs">
                <ShoppingBag size={48} className="text-muted-gray/40 mx-auto mb-4 animate-bounce" />
                <h3 className="text-base font-extrabold text-dark-navy">Select an Order</h3>
                <p className="text-xs text-muted-gray mt-1 max-w-xs mx-auto leading-relaxed font-semibold">
                  Click on any order in the history list to view tracking parameters, delivery location, items details, and feedback features.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Stepper tracking */}
                <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs space-y-4 text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-light-border/40">
                    <h3 className="text-xs font-extrabold text-dark-navy uppercase tracking-wider">
                      Tracking Milestones
                    </h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getOrderStatusClass(selectedOrder.orderStatus)}`}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>

                  {selectedOrder.orderStatus === "Cancelled" ? (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-xs font-semibold">
                      <span className="text-xl">⚠️</span>
                      <div>
                        <p className="font-extrabold text-rose-800">Order Cancelled</p>
                        <p className="mt-1 leading-normal text-rose-600">This order transaction has been cancelled. If you already completed payment, a refund will be processed within 5-7 business days.</p>
                      </div>
                    </div>
                  ) : (
                    /* Visual Stepper Steps */
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-2 py-4 relative w-full">
                      {/* Step 1: Processing */}
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-2 z-10 sm:flex-1 text-left sm:text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                          selectedOrder.orderStatus === "Processing" || selectedOrder.orderStatus === "Shipped" || selectedOrder.orderStatus === "Delivered"
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-white text-muted-gray border-slate-200"
                        }`}>
                          1
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-dark-navy">Processing</p>
                          <p className="text-[10px] text-muted-gray mt-0.5 font-semibold">Order confirmed & packing</p>
                        </div>
                      </div>

                      {/* Chain 1 */}
                      <div className="hidden sm:block flex-1 h-[2px] bg-slate-100 relative mx-4">
                        <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-500" style={{
                          width: selectedOrder.orderStatus === "Shipped" || selectedOrder.orderStatus === "Delivered" ? "100%" : "0%"
                        }}></div>
                      </div>
                      <div className="sm:hidden w-[2px] h-6 bg-slate-100 ml-4 -my-4 relative">
                        <div className="absolute top-0 left-0 w-full bg-primary transition-all duration-500" style={{
                          height: selectedOrder.orderStatus === "Shipped" || selectedOrder.orderStatus === "Delivered" ? "100%" : "0%"
                        }}></div>
                      </div>

                      {/* Step 2: Shipped */}
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-2 z-10 sm:flex-1 text-left sm:text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                          selectedOrder.orderStatus === "Shipped" || selectedOrder.orderStatus === "Delivered"
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-white text-muted-gray border-slate-200"
                        }`}>
                          2
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-dark-navy">Shipped</p>
                          <p className="text-[10px] text-muted-gray mt-0.5 font-semibold">In transit to destination</p>
                        </div>
                      </div>

                      {/* Chain 2 */}
                      <div className="hidden sm:block flex-1 h-[2px] bg-slate-100 relative mx-4">
                        <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-500" style={{
                          width: selectedOrder.orderStatus === "Delivered" ? "100%" : "0%"
                        }}></div>
                      </div>
                      <div className="sm:hidden w-[2px] h-6 bg-slate-100 ml-4 -my-4 relative">
                        <div className="absolute top-0 left-0 w-full bg-emerald-500 transition-all duration-500" style={{
                          height: selectedOrder.orderStatus === "Delivered" ? "100%" : "0%"
                        }}></div>
                      </div>

                      {/* Step 3: Delivered */}
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-2 z-10 sm:flex-1 text-left sm:text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                          selectedOrder.orderStatus === "Delivered"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-muted-gray border-slate-200"
                        }`}>
                          3
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-dark-navy">Delivered</p>
                          <p className="text-[10px] text-muted-gray mt-0.5 font-semibold">Delivered & verified</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items grid list */}
                <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs space-y-4 text-left">
                  <h3 className="text-xs font-extrabold text-dark-navy uppercase tracking-wider pb-3 border-b border-light-border/40">
                    Items Purchased
                  </h3>
                  <div className="divide-y divide-light-border/20">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-start">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-contain bg-soft-bg border border-light-border/30 p-1 rounded-xl flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-extrabold text-dark-navy leading-normal">
                            {item.name}
                          </h4>
                          <div className="flex justify-between items-center mt-2 text-xs font-semibold text-muted-gray">
                            <span>Qty: {item.quantity}</span>
                            <span className="font-extrabold text-dark-navy">₹{item.price.toLocaleString("en-IN")} each</span>
                          </div>
                          
                          {/* Write Review Button - Disabled once isReviewed is true */}
                          {selectedOrder.orderStatus !== "Cancelled" && (
                            <div className="flex justify-end mt-2 pt-2 border-t border-slate-50">
                              <button
                                type="button"
                                disabled={item.isReviewed}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReviewModal(item.productId, item.name);
                                }}
                                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border cursor-pointer transition active:scale-95 flex items-center gap-1 ${
                                  item.isReviewed
                                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-indigo-50 hover:bg-indigo-100 border-indigo-100/50 text-indigo-650"
                                }`}
                              >
                                <span>{item.isReviewed ? "✓ Reviewed" : "✍️ Review Product"}</span>
                              </button>
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logistics Info cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  
                  {/* Shipping address */}
                  <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs space-y-2">
                    <span className="text-[9px] text-muted-gray font-extrabold uppercase tracking-widest block">
                      Delivery Location
                    </span>
                    <div className="text-xs font-semibold text-muted-gray leading-normal space-y-1">
                      <p className="font-extrabold text-dark-navy">{selectedOrder.shippingAddress.address}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                      <p className="text-primary font-bold text-[9px] uppercase tracking-wider">{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>

                  {/* Payment details */}
                  <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs space-y-2">
                    <span className="text-[9px] text-muted-gray font-extrabold uppercase tracking-widest block">
                      Transaction info
                    </span>
                    <div className="text-xs font-semibold text-muted-gray space-y-1.5">
                      <p>Method: <strong className="text-dark-navy">{selectedOrder.paymentMethod}</strong></p>
                      <p>Txn ID: <strong className="font-mono text-dark-navy">{selectedOrder.transactionId}</strong></p>
                      <p>Subtotal: <strong className="text-primary font-extrabold">₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</strong></p>
                    </div>
                  </div>

                </div>

                {/* Cancel Order Action */}
                {selectedOrder.orderStatus !== "Delivered" && selectedOrder.orderStatus !== "Cancelled" && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handleCancelOrderClick(selectedOrder._id)}
                      className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-extrabold uppercase tracking-wider rounded-xl border border-rose-150 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      Cancel Entire Purchase
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
                        star <= reviewRating ? "text-amber-500" : "text-slate-200"
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
                <label className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">
                  Review Details
                </label>
                <textarea
                  required
                  rows="3"
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
