import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Users, 
  Mail, 
  Phone, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Loader2, 
  IndianRupee, 
  ShoppingCart,
  Calendar,
  Shield,
  Briefcase
} from "lucide-react";
import { allUsers, deleteUserApi, toggleUserSuspensionApi } from "../../api/AuthApi";
import { getAllOrders } from "../../api/OrderApi";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ordersCount: 0,
    totalSpent: 0,
    orders: []
  });

  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [actionLoading, setActionLoading] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadData = async () => {
    try {
      // Fetch users and orders
      const [usersRes, ordersRes] = await Promise.all([
        allUsers(),
        getAllOrders()
      ]);

      const foundUser = (usersRes.data || []).find(u => u._id === userId);
      setUser(foundUser);

      if (foundUser) {
        const allOrders = ordersRes.data.orders || [];

        // Filter orders placed by this user
        const userOrders = allOrders.filter(
          order => order.userId && (order.userId._id === userId || order.userId === userId)
        );

        // Calculate total spent (excluding cancelled orders)
        const totalSpent = userOrders.reduce((acc, order) => {
          if (order.orderStatus === "Cancelled") return acc;
          return acc + (order.totalAmount || 0);
        }, 0);

        setStats({
          ordersCount: userOrders.length,
          totalSpent,
          orders: userOrders
        });
      }
    } catch (err) {
      console.error("Error loading user details page data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async () => {
    setActionLoading(true);
    try {
      const res = await toggleUserSuspensionApi(userId);
      showToast(res.data.msg || "User status updated", "success");
      setUser(prev => ({ ...prev, isSuspended: !prev.isSuspended }));
      setShowSuspendModal(false);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to update suspension status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setActionLoading(true);
    try {
      await deleteUserApi(userId);
      showToast("User account deleted successfully from DB.", "success");
      setTimeout(() => {
        navigate("/admin/users");
      }, 1000);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to delete user", "error");
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">Loading user profile details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-dark-navy antialiased">
        <h2 className="text-xl font-extrabold mb-4">User Profile Not Found</h2>
        <Link 
          to="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-extrabold uppercase hover:bg-slate-50 transition"
        >
          <ArrowLeft size={14} /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="text-dark-navy antialiased text-left pb-12 space-y-6 relative">
      {/* Toast Alert */}
      {message && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-extrabold uppercase tracking-wide flex items-center gap-2 animate-slideRight ${
          toastType === "success" 
            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
            : "bg-red-50 text-red-655 border-red-100"
        }`}>
          {toastType === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
          {message}
        </div>
      )}

      {/* Header and Back Button */}
      <div className="flex items-center justify-between border-b border-light-border/40 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/users"
            className="p-2 border border-light-border hover:border-primary/30 hover:bg-primary/5 text-muted-gray hover:text-primary rounded-xl transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {user.name || "Customer Details"}
            </h1>
            <p className="text-xs text-muted-gray font-semibold mt-0.5">
              Customer Profile Information & Purchase History Directory.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSuspendModal(true)}
            disabled={actionLoading}
            className={`px-3 py-1.5 border rounded-xl text-xs font-extrabold uppercase transition cursor-pointer disabled:opacity-50 ${
              user.isSuspended 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
            }`}
          >
            {user.isSuspended ? "Reactivate User" : "Suspend User"}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={actionLoading}
            className="px-3 py-1.5 bg-red-50 text-red-655 border border-red-100 hover:bg-red-100 rounded-xl text-xs font-extrabold uppercase transition cursor-pointer disabled:opacity-50"
          >
            Delete User
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Profile Card */}
        <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs space-y-5 lg:col-span-1">
          <div className="flex items-center gap-4 pb-4 border-b border-light-border/40">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary flex-shrink-0 font-extrabold uppercase text-lg">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold">{user.name}</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase mt-1 border ${
                user.isSuspended 
                  ? "bg-red-50 text-red-600 border-red-100" 
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
              }`}>
                {user.isSuspended ? "Suspended" : "Active"}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-start gap-3">
              <Calendar className="text-muted-gray w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-gray uppercase block tracking-wider">Joined Date</span>
                <span className="text-dark-navy mt-0.5 block">
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="text-muted-gray w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-gray uppercase block tracking-wider">Email Address</span>
                <span className="text-dark-navy mt-0.5 block">{user.email}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="text-muted-gray w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-gray uppercase block tracking-wider">Phone Number</span>
                <span className="text-dark-navy mt-0.5 block">{user.phoneNumber || "N/A"}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="text-muted-gray w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-muted-gray uppercase block tracking-wider">Account Role</span>
                <span className="text-dark-navy mt-0.5 block font-bold uppercase text-[10px] tracking-wider">Customer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block">Total Orders</span>
                <span className="text-xl sm:text-2xl font-black text-dark-navy mt-1 block">{stats.ordersCount} Orders</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                <ShoppingCart size={20} />
              </div>
            </div>

            <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block">Total Spent</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">₹{stats.totalSpent.toLocaleString()}</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <IndianRupee size={20} />
              </div>
            </div>
          </div>

          {/* Orders list */}
          <div className="bg-white border border-light-border/60 rounded-3xl shadow-2xs p-5 space-y-4">
            <h3 className="text-sm font-extrabold tracking-wider uppercase border-b border-light-border/30 pb-2">
              Purchase History ({stats.ordersCount})
            </h3>
            
            {stats.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-light-border/60 text-left">
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest font-mono">ID</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Ordered Items</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-center">Date</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-center">Status</th>
                      <th className="px-4 py-3 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.orders.map(order => (
                      <tr key={order._id} className="border-b border-light-border/40 hover:bg-slate-50/20">
                        <td className="px-4 py-3 text-xs font-bold font-mono text-muted-gray">
                          #{order._id.substring(18)}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-dark-navy">
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-[11px]">
                                <span className="font-bold">{item.name}</span>
                                <span className="text-muted-gray">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-center font-semibold text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                            order.orderStatus === "Delivered"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : order.orderStatus === "Cancelled"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-dark-navy text-right">
                          ₹{order.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-xs font-semibold text-muted-gray py-6">No orders placed yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-scaleUp text-center relative">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto mb-4">
              <Shield size={20} />
            </div>

            <h3 className="text-base font-extrabold text-dark-navy tracking-tight mb-2">
              {user.isSuspended ? "Reactivate Account?" : "Suspend Account?"}
            </h3>
            <p className="text-xs text-muted-gray font-semibold mb-6 px-2 leading-relaxed text-center">
              {user.isSuspended
                ? `Unlock this user's profile. They will recover complete access to log in and order services immediately.`
                : `Suspend login privileges for ${user.name}. They will be blocked instantly from shopping, cart sessions, or dashboard operations.`}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                disabled={actionLoading}
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 border border-light-border rounded-xl text-xs font-extrabold uppercase tracking-wider text-muted-gray hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleToggleSuspend}
                className={`px-4 py-2 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  user.isSuspended 
                    ? "bg-emerald-500 hover:bg-emerald-600" 
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                {actionLoading && <Loader2 size={12} className="animate-spin" />}
                Confirm Status Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-scaleUp text-center relative">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle size={20} />
            </div>

            <h3 className="text-base font-extrabold text-dark-navy tracking-tight mb-2">
              Delete User Account?
            </h3>
            <p className="text-xs text-muted-gray font-semibold mb-6 px-2 leading-relaxed text-center">
              Are you sure you want to permanently delete the profile of <strong className="text-dark-navy">{user.name}</strong> from database? This action is irreversible.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                disabled={actionLoading}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-light-border rounded-xl text-xs font-extrabold uppercase tracking-wider text-muted-gray hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 size={12} className="animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
