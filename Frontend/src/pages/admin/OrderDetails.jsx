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
    <div className="relative leading-normal">
      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-150 shadow-md animate-slideIn">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toastType === "success"
                ? "bg-green-50 text-green-600 border border-green-100"
                : "bg-red-50 text-red-655 border border-red-100"
            }`}
          >
            {toastType === "success" ? <Check size={14} /> : <X size={14} />}
          </div>
          <span className="text-sm font-medium text-gray-800">{message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 leading-normal">
          Order Management
        </h1>
        <p className="text-[13px] font-normal text-gray-500 mt-1 leading-relaxed">
          Track customer checkouts, transaction IDs, payment validations, and update shipping lifecycle.
        </p>
      </div>

      {/* Analytics Stats Section */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="flex flex-col p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-[13px] font-normal text-gray-500">Total Volume</span>
            <div className="p-1.5 rounded-lg bg-green-50 text-green-600">
              <ShieldCheck size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-bold text-slate-800 mt-2 leading-tight">
            ₹{stats.totalVolume.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-[13px] font-normal text-gray-500">Orders Placed</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingBag size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-bold text-slate-800 mt-2 leading-tight">
            {stats.totalOrdersCount}
          </span>
        </div>
      </div>

      {/* Search & Filters Block */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 mb-6 shadow-sm shadow-slate-100/30">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Search size={15} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, buyer, email, or TXN..."
              className="w-full pl-8 pr-8 py-2 bg-slate-50/70 border border-slate-100 rounded-lg focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-455 hover:text-gray-600 cursor-pointer"
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
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-100 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>

          {/* Sort Order */}
          <div className="relative min-w-[140px]">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-100 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="price-low-high">Price: Low to High</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>

          {/* Reset Filters */}
          {(statusFilter !== "All" || searchQuery.trim() || sortOrder !== "newest") && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 border border-red-100 text-red-500 hover:bg-red-50/40 py-2 px-3.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer h-[34px]"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Registry Card */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm shadow-slate-100/30">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
          <h2 className="text-base font-semibold text-slate-800">Orders Registry</h2>
          <span className="text-[13px] font-normal text-gray-500">
            Showing {filteredOrders.length} of {orders.length}
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#088178] w-8 h-8 mb-4" />
            <p className="text-xs font-normal text-gray-500 animate-pulse">Loading order database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center shadow-sm">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Orders Found</h3>
            <p className="text-[13px] font-normal text-gray-500 mt-1">Try resetting filters or adjusting search queries.</p>
            {(statusFilter !== "All" || searchQuery.trim()) && (
              <button
                onClick={handleResetFilters}
                className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/65 text-gray-500 border-b border-slate-100 text-[13px] font-normal">
                  <th className="py-3 px-4 w-[15%]">Order / Date</th>
                  <th className="py-3 px-4 w-[20%]">Customer Details</th>
                  <th className="py-3 px-4 w-[25%]">Products Purchased</th>
                  <th className="py-3 px-4 w-[20%]">Payment Metadata</th>
                  <th className="py-3 px-4 w-[12%]">Order Status</th>
                  <th className="py-3 px-4 text-right w-[8%]">Total Price</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-[14px] font-normal text-slate-800">
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50/30 transition-all duration-200"
                  >
                    {/* Order ID & Date */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#088178] font-mono text-[14px]">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[12px] text-gray-400 font-normal flex items-center gap-1">
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
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5 max-w-[160px] truncate">
                        <span className="font-medium text-slate-850">
                          {order.userId?.name || "Guest Account"}
                        </span>
                        <span className="text-[12px] text-gray-400 font-normal truncate">
                          {order.userId?.email || "herekinshuk@gmail.com"}
                        </span>
                      </div>
                    </td>

                    {/* Purchased Products */}
                    <td className="py-4 px-4">
                      <div className="space-y-1 max-w-[220px]">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-[13px] text-slate-600"
                          >
                            <span className="truncate pr-2">{item.name}</span>
                            <span className="text-[11px] text-gray-400 font-bold bg-slate-100 px-1.5 py-0.2 rounded-md flex-shrink-0">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Payment/Transaction ID */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[13px] text-slate-650 font-bold select-all">
                          {order.transactionId}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">
                            {order.paymentMethod}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          <span className="text-[10px] text-green-600 font-bold uppercase">
                            {order.paymentStatus || "Paid"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Order Status Select Dropdown */}
                    <td className="py-4 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border outline-none cursor-pointer focus:ring-4 focus:ring-[#088178]/5 transition-all ${
                          order.orderStatus === "Delivered"
                            ? "bg-green-50 text-green-700 border-green-150"
                            : order.orderStatus === "Shipped"
                            ? "bg-blue-50 text-blue-700 border-blue-150"
                            : order.orderStatus === "Cancelled"
                            ? "bg-red-50 text-red-700 border-red-150"
                            : "bg-yellow-50 text-yellow-700 border-yellow-150"
                        }`}
                      >
                        <option value="Processing" className="bg-white text-slate-800">
                          Processing
                        </option>
                        <option value="Shipped" className="bg-white text-slate-800">
                          Shipped
                        </option>
                        <option value="Delivered" className="bg-white text-slate-800">
                          Delivered
                        </option>
                        <option value="Cancelled" className="bg-white text-slate-800">
                          Cancelled
                        </option>
                      </select>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 text-right">
                      <span className="text-sm font-extrabold text-slate-900">
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
