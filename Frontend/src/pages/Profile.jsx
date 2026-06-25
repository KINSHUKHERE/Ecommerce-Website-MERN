import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserProfile, updateProfile } from "../api/AuthApi";
import { getUserOrders } from "../api/OrderApi";
import {
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  Check,
  X,
  Shield,
  Eye,
  EyeOff,
  ShoppingBag,
  Calendar,
  Hash,
  MapPin,
  Info
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Profile fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [hasPassword, setHasPassword] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Tab controller state
  const [activeTab, setActiveTab] = useState("settings");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Toast notifications
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const localUser = JSON.parse(localStorage.getItem("user"));

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const fetchUserOrdersData = async () => {
    if (!localUser || !localUser._id) return;
    setLoadingOrders(true);
    try {
      const res = await getUserOrders();
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Failed to load user orders", err);
      showToast("Unable to fetch your order history", "error");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!localUser || !localUser._id) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await getUserProfile();
        const data = res.data;
        setName(data.name || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phoneNumber || "");
        setRole(data.role || "user");
        setHasPassword(data.hasPassword !== false);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        showToast("Failed to load profile details", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();

    // Check if redirect state indicates direct tab switch
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      if (location.state.activeTab === "orders") {
        fetchUserOrdersData();
      }
    }
  }, [navigate, location.state]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Name field is required", "error");
      return;
    }

    if (password && password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password ? password : undefined,
      });

      const updatedUser = res.data.user;

      const newLocalStorageUser = {
        ...localUser,
        name: updatedUser.name,
        phoneNumber: updatedUser.phoneNumber,
      };
      localStorage.setItem("user", JSON.stringify(newLocalStorageUser));

      window.dispatchEvent(new Event("storage"));

      showToast("Profile updated successfully", "success");
      if (password) {
        setHasPassword(true);
        setShowPasswordFields(false);
      }
      setPassword("");
      setConfirmPassword("");

    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to update profile", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="animate-spin text-[#088178] w-10 h-10 mb-4" />
        <p className="text-sm font-normal text-gray-500 animate-pulse">
          Loading profile details...
        </p>
      </div>
    );
  }

  const isAdmin = role === "admin";

  const getOrderStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-50 text-green-700 border-green-150";
      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-150";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-150";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-150";
    }
  };

  return (
    <div className={`max-w-2xl mx-auto ${isAdmin ? "mt-4" : "my-12 px-4 md:px-0"}`}>
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
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 leading-normal">
            Account Management
          </h1>
          <p className="text-[13px] font-normal text-gray-500 mt-1 leading-relaxed">
            Update account details or view your e-commerce order transactions.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 text-sm font-bold transition-all relative border-b-2 -mb-px outline-none focus:outline-none cursor-pointer ${
            activeTab === "settings"
              ? "text-[#088178] border-[#088178]"
              : "text-gray-500 border-transparent hover:text-gray-800"
          }`}
        >
          Profile Settings
        </button>
        {!isAdmin && (
          <button
            onClick={() => {
              setActiveTab("orders");
              fetchUserOrdersData();
            }}
            className={`px-4 py-2.5 text-sm font-bold transition-all relative border-b-2 -mb-px outline-none focus:outline-none cursor-pointer ${
              activeTab === "orders"
                ? "text-[#088178] border-[#088178]"
                : "text-gray-500 border-transparent hover:text-gray-800"
            }`}
          >
            My Orders
          </button>
        )}
      </div>

      {/* RENDER TAB 1: PROFILE SETTINGS */}
      {activeTab === "settings" && (
        <div className="bg-white border border-slate-100 rounded-xl p-5 md:p-6 shadow-sm shadow-slate-100/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#088178]"></div>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* User Role Indicator (Locked) */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-2">
              <span className="text-[13px] font-normal text-gray-500">Account Type:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#088178]/5 text-[#088178] border border-[#088178]/10 uppercase tracking-wider">
                <Shield size={12} />
                {role}
              </span>
            </div>

            {/* Full Name field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[13px] font-normal text-gray-500">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-150 rounded-lg focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all h-[38px]"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            {/* Email field (Read-Only) */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-normal text-gray-500">
                  Email Address
                </label>
                <span className="text-[11px] text-gray-450 font-normal select-none">
                  Not editable
                </span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full pl-9 pr-4 py-2 border border-slate-150 rounded-lg bg-slate-50 text-gray-400 text-sm font-normal cursor-not-allowed h-[38px] select-none"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                  <Lock size={13} />
                </span>
              </div>
            </div>

            {/* Phone Number field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[13px] font-normal text-gray-500">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                  <Phone size={15} />
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-150 rounded-lg focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all h-[38px]"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {!hasPassword && !showPasswordFields ? (
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Shield size={16} className="text-[#088178]" />
                    Account Security
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Password: <span className="font-semibold text-red-500">Not Set</span>. Click below to establish local email & password credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(true)}
                  className="px-4 py-1.5 bg-[#088178]/10 hover:bg-[#088178]/20 text-[#088178] text-xs font-bold rounded-lg transition-all self-start sm:self-center cursor-pointer"
                >
                  Set Password
                </button>
              </div>
            ) : (
              <>
                {/* Password field */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[13px] font-normal text-gray-500">
                    {hasPassword ? "New Password" : "Set Password"}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 border border-slate-150 rounded-lg focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all h-[38px]"
                      placeholder={hasPassword ? "Leave blank to keep current" : "Enter a password"}
                      required={!hasPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 outline-none focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field */}
                {password && (
                  <div className="flex flex-col gap-1.5 text-left animate-fadeIn">
                    <label className="text-[13px] font-normal text-gray-500">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                        <Lock size={15} />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 border border-slate-150 rounded-lg focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all h-[38px]"
                        placeholder="Re-enter password"
                        required={!!password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 outline-none focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-550 text-red-500 mt-1 text-left">❌ Passwords do not match</p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-green-600 mt-1 text-left">✓ Passwords match</p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Action Row */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => {
                  if (isAdmin) {
                    navigate("/admin");
                  } else {
                    navigate("/");
                  }
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-gray-700 text-xs font-semibold rounded-lg transition-all h-[38px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#088178] hover:bg-[#06635c] text-white text-xs font-bold rounded-lg shadow-sm transition-all h-[38px] disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={15} />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENDER TAB 2: MY ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-16 flex flex-col items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm">
              <Loader2 className="animate-spin text-[#088178] w-8 h-8 mb-3" />
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider animate-pulse">
                Fetching Order History...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-100 rounded-xl shadow-sm px-6">
              <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-base font-bold text-gray-600">No Orders Placed Yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                When you make purchases via our secure checkout gateway, your orders will appear here.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="mt-5 px-5 py-2 bg-[#088178] hover:bg-[#06635c] text-white text-xs font-bold rounded-lg transition shadow-md shadow-[#088178]/10 cursor-pointer outline-none focus:outline-none"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm shadow-slate-100/30 space-y-4 text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100"></div>

                  {/* Order Card Header details */}
                  <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">
                          Order Reference
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          #{order._id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar size={12} />
                        <span>{new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}</span>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border ${getOrderStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Products purchased in the order */}
                  <div className="divide-y divide-slate-50">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-start">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-contain bg-slate-50 border border-slate-100 p-0.5 rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                            {item.name}
                          </h4>
                          <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
                            <span>Qty: {item.quantity}</span>
                            <span className="font-bold text-slate-650">₹{item.price.toLocaleString()} each</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details Footer */}
                  <div className="pt-3.5 border-t border-slate-100 grid md:grid-cols-2 gap-4 text-xs font-medium text-slate-600 bg-slate-50/50 -mx-5 -mb-5 px-5 py-4">
                    
                    {/* Shipping Address Summary */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">
                        Shipping Address
                      </span>
                      <div className="text-[11px] text-slate-700 leading-normal flex items-start gap-1">
                        <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Cost & Transaction Metadata */}
                    <div className="space-y-1.5 md:text-right flex flex-col md:items-end justify-between">
                      <div className="w-full flex justify-between md:justify-end gap-3 items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Transaction ID
                        </span>
                        <span className="font-mono text-[11px] text-slate-700 block select-all">
                          {order.transactionId}
                        </span>
                      </div>
                      <div className="w-full flex justify-between md:justify-end gap-3 items-center pt-1">
                        <span className="text-[11px] text-slate-800 font-bold">Total Amount Paid:</span>
                        <span className="text-base font-extrabold text-[#088178]">
                          ₹{order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
