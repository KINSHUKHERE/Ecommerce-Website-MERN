import React, { useEffect, useState, useMemo } from "react";
import { getAllOrders, updateOrderStatus } from "../../api/OrderApi";
import {
  Loader2,
  Check,
  X,
  ShoppingBag,
  Calendar,
  ShieldCheck,
  Search,
  RotateCcw,
} from "lucide-react";

const OrderDetails = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Success/error messages
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch admin orders", err);
      showToast("Unable to load orders from database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`, "success");

      // Update state dynamically
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: res.data.order.orderStatus }
            : order
        )
      );
    } catch (err) {
      console.error("Failed to update status", err);
      showToast("Failed to update order status", "error");
    }
  };

  const handleResetFilters = () => {
    setStatusFilter("All");
    setSearchQuery("");
    setSortOrder("newest");
    showToast("Filters reset successfully", "success");
  };

  // Analytics Stats Section
  const stats = useMemo(() => {
    const totalVolume = orders.reduce((sum, o) => {
      if (o.orderStatus === "Cancelled") return sum;
      return sum + (o.totalAmount || 0);
    }, 0);
    const totalOrdersCount = orders.length;
    return { totalVolume, totalOrdersCount };
  }, [orders]);

  // Filter & Sort calculation
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // 1. Status Filter
    if (statusFilter !== "All") {
      result = result.filter((order) => order.orderStatus === statusFilter);
    }

    // 2. Search Query (Search by customer name, email, transactionId, or order ID)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((order) => {
        const userName = (order.userId?.name || "").toLowerCase();
        const userEmail = (order.userId?.email || "").toLowerCase();
        const txnId = (order.transactionId || "").toLowerCase();
        const orderId = (order._id || "").toLowerCase();
        return (
          userName.includes(query) ||
          userEmail.includes(query) ||
          txnId.includes(query) ||
          orderId.includes(query)
        );
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortOrder === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortOrder === "price-high-low") {
        return b.totalAmount - a.totalAmount;
      }
      if (sortOrder === "price-low-high") {
        return a.totalAmount - b.totalAmount;
      }
      return 0;
    });

    return result;
  }, [orders, statusFilter, searchQuery, sortOrder]);

  return (
    <div className="relative text-dark-navy antialiased text-left">
      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed bottom-5 right-5 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              toastType === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {toastType === "success" ? <Check size={12} /> : <X size={12} />}
          </div>
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 border-b border-light-border/40 pb-4">
        <h1 className="text-2xl font-extrabold text-dark-navy tracking-tight">
          Order Management
        </h1>
        <p className="text-xs text-muted-gray font-semibold mt-1">
          Track customer checkouts, transaction IDs, payment validations, and update shipping lifecycle.
        </p>
      </div>

      {/* Analytics Stats Section */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="flex flex-col p-4 bg-white border border-light-border/60 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-widest">Total Volume</span>
            <div className="p-1.5 rounded-xl bg-primary/5 text-primary">
              <ShieldCheck size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">
            ₹{stats.totalVolume.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col p-4 bg-white border border-light-border/60 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-widest">Orders Placed</span>
            <div className="p-1.5 rounded-xl bg-primary/5 text-primary">
              <ShoppingBag size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">
            {stats.totalOrdersCount}
          </span>
        </div>
      </div>

      {/* Search & Filters Block */}
      <div className="bg-white border border-light-border/60 rounded-2xl p-4 mb-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
              <Search size={15} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, buyer, email, or TXN..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-light-border bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy h-[36px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray hover:text-dark-navy cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-light-border bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy appearance-none cursor-pointer h-[36px]"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>

          {/* Sort Order */}
          <div className="relative min-w-[140px]">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-light-border bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy appearance-none cursor-pointer h-[36px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="price-low-high">Price: Low to High</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>

          {/* Reset Filters */}
          {(statusFilter !== "All" || searchQuery.trim() || sortOrder !== "newest") && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer h-[36px]"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Registry Card */}
      <div className="bg-white border border-light-border/60 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-light-border/40 flex justify-between items-center bg-slate-50/20">
          <h2 className="text-xs font-extrabold text-dark-navy uppercase tracking-widest">Orders Registry</h2>
          <span className="text-xs font-bold text-muted-gray">
            Showing {filteredOrders.length} of {orders.length}
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8 mb-4" />
            <p className="text-xs font-bold text-muted-gray animate-pulse">Loading order database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-gray/50 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-dark-navy uppercase tracking-widest">No Orders Found</h3>
            <p className="text-xs font-semibold text-muted-gray mt-1">Try resetting filters or adjusting search queries.</p>
            {(statusFilter !== "All" || searchQuery.trim()) && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 border border-light-border hover:bg-slate-50 text-dark-navy text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/65 text-muted-gray border-b border-light-border/40 text-[10px] font-extrabold uppercase tracking-widest">
                  <th className="py-3.5 px-6 w-[15%]">Order / Date</th>
                  <th className="py-3.5 px-6 w-[20%]">Customer Details</th>
                  <th className="py-3.5 px-6 w-[25%]">Products Purchased</th>
                  <th className="py-3.5 px-6 w-[20%]">Payment Metadata</th>
                  <th className="py-3.5 px-6 w-[12%]">Order Status</th>
                  <th className="py-3.5 px-6 text-right w-[8%]">Total Price</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-light-border/40 text-sm font-semibold text-dark-navy">
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50/30 transition-all duration-200"
                  >
                    {/* Order ID & Date */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-primary font-mono text-sm">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-muted-gray font-semibold mt-0.5 flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5 max-w-[160px] truncate">
                        <span className="font-bold text-dark-navy">
                          {order.userId?.name || "Guest Account"}
                        </span>
                        <span className="text-xs text-muted-gray font-semibold truncate mt-0.5">
                          {order.userId?.email || "herekinshuk@gmail.com"}
                        </span>
                      </div>
                    </td>

                    {/* Purchased Products */}
                    <td className="py-4 px-6">
                      <div className="space-y-1 max-w-[220px]">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-xs text-dark-navy font-semibold"
                          >
                            <span className="truncate pr-2">{item.name}</span>
                            <span className="text-[10px] font-bold text-muted-gray bg-slate-100 border border-light-border/45 px-1.5 py-0.5 rounded-lg flex-shrink-0">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Payment/Transaction ID */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs text-dark-navy font-bold select-all">
                          {order.transactionId}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-muted-gray uppercase font-extrabold tracking-wider">
                            {order.paymentMethod}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                          <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider">
                            {order.paymentStatus || "Paid"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Order Status Select Dropdown */}
                    <td className="py-4 px-6">
                      <div className="relative inline-block">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer focus:ring-4 focus:ring-primary/5 transition-all ${
                            order.orderStatus === "Delivered"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : order.orderStatus === "Shipped"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : order.orderStatus === "Cancelled"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}
                        >
                          <option value="Processing" className="bg-white text-dark-navy">
                            Processing
                          </option>
                          <option value="Shipped" className="bg-white text-dark-navy">
                            Shipped
                          </option>
                          <option value="Delivered" className="bg-white text-dark-navy">
                            Delivered
                          </option>
                          <option value="Cancelled" className="bg-white text-dark-navy">
                            Cancelled
                          </option>
                        </select>
                        <span className={`absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none ${
                          order.orderStatus === "Delivered" ? "text-emerald-600" :
                          order.orderStatus === "Shipped" ? "text-blue-600" :
                          order.orderStatus === "Cancelled" ? "text-rose-600" : "text-amber-600"
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </span>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-6 text-right">
                      <span className="text-sm font-extrabold text-dark-navy">
                        ₹{order.totalAmount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
