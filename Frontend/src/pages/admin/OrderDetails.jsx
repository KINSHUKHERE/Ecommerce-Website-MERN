import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../../api/OrderApi";
import {
  Loader2,
  Check,
  X,
  ShoppingBag,
  Calendar,
  ShieldCheck,
  Search,
  SlidersHorizontal,
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
      setOrders(res.data.orders);
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
      setOrders(
        orders.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: res.data.order.orderStatus }
            : order,
        ),
      );
    } catch (err) {
      console.error("Failed to update status", err);
      showToast("Failed to update order status", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="animate-spin text-[#088178] w-10 h-10 mb-4" />
        <p className="text-sm font-normal text-gray-500 animate-pulse">
          Loading order database...
        </p>
      </div>
    );
  }

  // Filter & Sort calculation
  const filteredOrders = orders
    .filter((order) => {
      // 1. Status Filter
      if (statusFilter !== "All" && order.orderStatus !== statusFilter) {
        return false;
      }
      // 2. Search Query (Search by customer name, email, transactionId, or order ID)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const userName = (order.userId?.name || "").toLowerCase();
        const userEmail = (order.userId?.email || "").toLowerCase();
        const txnId = (order.transactionId || "").toLowerCase();
        const orderId = (order._id || "").toLowerCase();
        if (
          !userName.includes(query) &&
          !userEmail.includes(query) &&
          !txnId.includes(query) &&
          !orderId.includes(query)
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
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

  return (
    <div className="p-4 sm:p-6 text-left">
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

      {/* Main Container Card */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 md:p-6 shadow-sm shadow-slate-100/30 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#088178]"></div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 leading-normal flex items-center gap-2">
              <ShieldCheck size={24} className="text-[#088178]" />
              Order Management
            </h1>
            <p className="text-[13px] font-normal text-gray-500 mt-1 leading-relaxed">
              Track customer checkouts, transaction IDs, payment validations,
              and update shipping lifecycle.
            </p>
          </div>

          {/* Stats summary boxes */}
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">
                Total Volume
              </span>
              <span className="text-sm font-extrabold text-[#088178]">
                ₹
                {orders
                  .reduce((sum, o) => {
                    if (o.orderStatus === "Cancelled") return sum;
                    return sum + o.totalAmount;
                  }, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">
                Orders Placed
              </span>
              <span className="text-sm font-extrabold text-slate-700">
                {orders.length}
              </span>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag
              size={48}
              className="text-gray-300 mx-auto mb-4"
              strokeWidth={1.5}
            />
            <h2 className="text-base font-bold text-gray-600">
              No Orders Found
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Customer checkouts recorded on the gateway will appear here
              dynamically.
            </p>
          </div>
        ) : (
          <>
            {/* Search & Filter Row */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between border-b border-slate-100 pb-5">
              {/* Search bar */}
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, buyer, email, or TXN..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/70 focus:bg-white rounded-lg focus:border-[#088178] focus:ring-4 focus:ring-[#088178]/5 outline-none transition-all text-xs font-semibold text-gray-700"
                />
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:border-[#088178] outline-none text-xs font-semibold text-gray-700 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort:</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:border-[#088178] outline-none text-xs font-semibold text-gray-700 cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="price-low-high">Price: Low to High</option>
                  </select>
                </div>
                
                {/* Reset Button */}
                {(statusFilter !== "All" || searchQuery.trim() || sortOrder !== "newest") && (
                  <button
                    onClick={() => {
                      setStatusFilter("All");
                      setSearchQuery("");
                      setSortOrder("newest");
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <SlidersHorizontal
                  size={36}
                  className="text-gray-300 mx-auto mb-3"
                />
                <h3 className="text-sm font-bold text-gray-600">
                  No Matching Orders Found
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Adjust or reset your filters to view customer checkout records.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-inner">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="p-4 text-left font-bold">Order / Date</th>
                      <th className="p-4 text-left font-bold">Customer Details</th>
                      <th className="p-4 text-left font-bold">
                        Products Purchased
                      </th>
                      <th className="p-4 text-left font-bold">Payment Metadata</th>
                      <th className="p-4 text-left font-bold">Order Status</th>
                      <th className="p-4 text-right font-bold">Total Price</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-slate-50/50 transition-colors duration-200"
                      >
                        {/* Order ID & Date */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-[#088178] font-mono">
                              #{order._id.slice(-8).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                              <Calendar size={11} />
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1 max-w-[160px] truncate">
                            <span className="font-bold text-slate-850">
                              {order.userId?.name || "Guest Account"}
                            </span>
                            <span className="text-[11px] text-gray-400 font-semibold truncate">
                              {order.userId?.email || "herekinshuk@gmail.com"}
                            </span>
                          </div>
                        </td>

                        {/* Purchased Products */}
                        <td className="p-4">
                          <div className="space-y-1 max-w-[200px]">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-[11px] text-slate-600"
                              >
                                <span className="truncate pr-2">{item.name}</span>
                                <span className="text-[10px] text-gray-400 font-bold bg-slate-100 px-1.5 py-0.2 rounded-md">
                                  x{item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Payment/Transaction ID */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[11px] text-slate-650 font-bold select-all">
                              {order.transactionId}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-gray-400 uppercase font-semibold">
                                {order.paymentMethod}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              <span className="text-[9px] text-green-600 font-bold uppercase">
                                {order.paymentStatus || "Paid"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Order Status Select Dropdown */}
                        <td className="p-4">
                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              handleStatusChange(order._id, e.target.value)
                            }
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
                            <option
                              value="Processing"
                              className="bg-white text-slate-800"
                            >
                              Processing
                            </option>
                            <option
                              value="Shipped"
                              className="bg-white text-slate-800"
                            >
                              Shipped
                            </option>
                            <option
                              value="Delivered"
                              className="bg-white text-slate-800"
                            >
                              Delivered
                            </option>
                            <option
                              value="Cancelled"
                              className="bg-white text-slate-800"
                            >
                              Cancelled
                            </option>
                          </select>
                        </td>

                        {/* Total Amount */}
                        <td className="p-4 text-right">
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
          </>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
