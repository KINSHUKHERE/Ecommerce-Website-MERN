import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserProfile, updateProfile, uploadAvatarApi } from "../api/AuthApi";
import { getUserOrders } from "../api/OrderApi";
import { getAddresses, addAddress, updateAddress, deleteAddress } from "../api/AddressApi";
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
  MapPin,
  Trash2,
  Edit
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
  const [avatar, setAvatar] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [gstin, setGstin] = useState("");

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Tab controller state
  const [activeTab, setActiveTab] = useState("settings");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [userOrderStatusFilter, setUserOrderStatusFilter] = useState("All");

  // Toast notifications
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    streetAddress: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India"
  });

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

  const fetchUserAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await getAddresses();
      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error("Failed to load user addresses", err);
      showToast("Unable to fetch your address book", "error");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (!addressForm.streetAddress.trim()) {
      showToast("Street address is required", "error");
      return;
    }
    if (!addressForm.city.trim()) {
      showToast("City is required", "error");
      return;
    }
    if (!addressForm.state.trim()) {
      showToast("State is required", "error");
      return;
    }
    if (!addressForm.pinCode.trim()) {
      showToast("Postal code is required", "error");
      return;
    }
    if (addressForm.pinCode.trim().length !== 6 || !/^\d+$/.test(addressForm.pinCode.trim())) {
      showToast("PIN / Postal Code must be a 6-digit number", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (editingAddressId) {
        // Edit Address
        await updateAddress(editingAddressId, {
          streetAddress: addressForm.streetAddress.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pinCode: addressForm.pinCode.trim(),
          country: addressForm.country.trim()
        });
        showToast("Address updated successfully", "success");
      } else {
        // Add Address
        if (addresses.length >= 10) {
          showToast("You can save up to 10 addresses only.", "error");
          setSubmitting(false);
          return;
        }
        await addAddress({
          streetAddress: addressForm.streetAddress.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pinCode: addressForm.pinCode.trim(),
          country: addressForm.country.trim()
        });
        showToast("Address saved successfully", "success");
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({ streetAddress: "", city: "", state: "", pinCode: "", country: "India" });
      fetchUserAddresses();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to save address", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAddressClick = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode,
      country: addr.country || "India"
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddressClick = async (addrId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(addrId);
        showToast("Address deleted successfully", "success");
        fetchUserAddresses();
      } catch (err) {
        console.error("Failed to delete address", err);
        showToast("Failed to delete address", "error");
      }
    }
  };

  useEffect(() => {
    if (location.state?.alertMsg) {
      showToast(location.state.alertMsg, "error");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
        setAvatar(data.avatar || "");
        setBusinessName(data.businessName || "");
        setBusinessAddress(data.businessAddress || "");
        setGstin(data.gstin || "");
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
      } else if (location.state.activeTab === "addresses") {
        fetchUserAddresses();
      }
    }
  }, [navigate, location.state]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size must be less than 2MB", "error");
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await uploadAvatarApi(file);
      setAvatar(res.data.url);
      showToast("Image uploaded successfully! Press Save to apply changes.", "success");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to upload image", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    showToast("Profile image removed. Press Save to apply changes.", "success");
  };

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
      const isVendor = role === "vendor";
      const res = await updateProfile({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password ? password : undefined,
        avatar: avatar,
        ...(isVendor ? {
          businessName: businessName.trim(),
          businessAddress: businessAddress.trim(),
          gstin: gstin.trim(),
        } : {}),
      });

      const updatedUser = res.data.user;

      const newLocalStorageUser = {
        ...localUser,
        name: updatedUser.name,
        phoneNumber: updatedUser.phoneNumber,
        avatar: updatedUser.avatar,
        ...(isVendor ? {
          businessName: updatedUser.businessName,
          businessAddress: updatedUser.businessAddress,
          gstin: updatedUser.gstin,
        } : {}),
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 bg-soft-bg/30">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">
          Loading profile details...
        </p>
      </div>
    );
  }

  const isAdmin = role === "admin";
  const isDashboardUser = role === "admin" || role === "vendor";

  const getOrderStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Shipped":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Cancelled":
        return "bg-red-50 text-red-655 border-red-100";
      default:
        return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto text-dark-navy antialiased ${isDashboardUser ? "mt-4" : "my-12 px-6"}`}>
      
      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 md:top-auto md:left-auto md:bottom-5 md:right-5 md:translate-x-0 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn max-w-[90vw] w-max">
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
      <div className="mb-6 flex justify-between items-start text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-navy tracking-tight leading-normal">
            Account Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-gray mt-1.5 font-medium leading-relaxed">
            Update account details or view your e-commerce order transactions.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-light-border/60 mb-8 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all relative border-b-2 -mb-px outline-none focus:outline-none cursor-pointer whitespace-nowrap flex-shrink-0 ${
            activeTab === "settings"
              ? "text-primary border-primary"
              : "text-muted-gray border-transparent hover:text-dark-navy"
          }`}
        >
          Profile Settings
        </button>
        {!isDashboardUser && (
          <button
            onClick={() => {
              setActiveTab("orders");
              fetchUserOrdersData();
            }}
            className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all relative border-b-2 -mb-px outline-none focus:outline-none cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === "orders"
                ? "text-primary border-primary"
                : "text-muted-gray border-transparent hover:text-dark-navy"
            }`}
          >
            My Orders
          </button>
        )}
        {!isDashboardUser && (
          <button
            onClick={() => {
              setActiveTab("addresses");
              fetchUserAddresses();
            }}
            className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all relative border-b-2 -mb-px outline-none focus:outline-none cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === "addresses"
                ? "text-primary border-primary"
                : "text-muted-gray border-transparent hover:text-dark-navy"
            }`}
          >
            Address Book
          </button>
        )}
      </div>

      {/* RENDER TAB 1: PROFILE SETTINGS */}
      {activeTab === "settings" && (
        <div className="bg-white border border-light-border/60 rounded-3xl p-5 md:p-6 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* User Role Indicator (Locked) */}
            <div className="flex items-center gap-2 pb-3 border-b border-light-border/40 mb-2">
              <span className="text-xs font-extrabold text-muted-gray uppercase tracking-widest">Account Type:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/5 text-primary border border-primary/10 uppercase tracking-widest select-none">
                <Shield size={11} />
                {role}
              </span>
            </div>

            {/* Avatar Selection Field */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-light-border/40 mb-3 text-left">
              <div className="relative">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 bg-slate-50 shadow-inner" 
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-100 border border-light-border/40 flex items-center justify-center text-muted-gray font-extrabold text-lg select-none">
                    {name ? name.charAt(0).toUpperCase() : <User size={28} />}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center sm:items-start gap-1">
                <span className="text-xs font-extrabold text-dark-navy uppercase tracking-wider">Profile Picture</span>
                <p className="text-[10px] text-muted-gray text-center sm:text-left font-semibold">JPG, PNG or WEBP. Max 2MB. Optional.</p>
                
                <div className="flex items-center gap-2.5 mt-1.5">
                  <label 
                    htmlFor="avatar-input" 
                    className="cursor-pointer text-[11px] font-bold text-primary hover:text-primary-hover py-1 px-3 bg-accent-light hover:bg-primary hover:text-white border border-primary/10 rounded-lg flex items-center gap-1 shadow-2xs transition-all duration-300"
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 size={11} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <span>Change</span>
                    )}
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="avatar-input" 
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                  
                  {avatar && (
                    <button 
                      type="button" 
                      onClick={handleRemoveAvatar} 
                      className="text-[11px] font-bold text-red-500 hover:text-red-650 transition-colors py-1 px-3 bg-red-50 rounded-lg shadow-2xs cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  id="profile-name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            {/* Email field (Read-Only) */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex justify-between items-center">
                <label htmlFor="profile-email" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                  Email Address
                </label>
                <span className="text-[10px] text-muted-gray font-bold select-none uppercase tracking-wider">
                  Not editable
                </span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  id="profile-email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  disabled
                  className="w-full pl-9 pr-4 py-2 border border-light-border rounded-xl bg-slate-50 text-slate-400 text-sm font-semibold cursor-not-allowed h-[38px] select-none"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray">
                  <Lock size={13} />
                </span>
              </div>
            </div>

            {/* Phone Number field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="profile-phone" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                  <Phone size={15} />
                </span>
                <input
                  type="tel"
                  id="profile-phone"
                  name="phone"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {role === "vendor" && (
              <>
                {/* Business Name */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="profile-biz-name" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                    Business / Store Name
                  </label>
                  <input
                    type="text"
                    id="profile-biz-name"
                    name="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                    placeholder="Enter business name"
                    required
                  />
                </div>

                {/* GSTIN */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="profile-gstin" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                    GSTIN / Tax ID
                  </label>
                  <input
                    type="text"
                    id="profile-gstin"
                    name="gstin"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full px-3.5 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                    placeholder="Enter GSTIN"
                    required
                  />
                </div>

                {/* Business Address */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="profile-biz-address" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                    Business Address
                  </label>
                  <textarea
                    id="profile-biz-address"
                    name="businessAddress"
                    rows="3"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full px-3.5 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all resize-none"
                    placeholder="Enter business address"
                    required
                  />
                </div>
              </>
            )}

            {!hasPassword && !showPasswordFields ? (
              <div className="bg-soft-bg border border-light-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
                <div>
                  <h4 className="text-xs font-extrabold text-dark-navy uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={14} className="text-primary" />
                    Account Security
                  </h4>
                  <p className="text-[10px] text-muted-gray mt-1.5 font-semibold">
                    Password: <span className="font-extrabold text-red-500">Not Set</span>. Click below to establish local email & password credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(true)}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all self-start sm:self-center cursor-pointer"
                >
                  Set Password
                </button>
              </div>
            ) : (
              <>
                {/* Password field */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                    {hasPassword ? "New Password" : "Set Password"}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="profile-new-password"
                      name="new-password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                      placeholder={hasPassword ? "Leave blank to keep current" : "Enter a password"}
                      required={!hasPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray hover:text-dark-navy outline-none focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field */}
                {password && (
                  <div className="flex flex-col gap-1.5 text-left animate-fadeIn">
                    <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                      Confirm Password <span className="text-red-555">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                        <Lock size={15} />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="profile-confirm-password"
                        name="confirm-password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                        placeholder="Confirm password"
                        required={!!password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray hover:text-dark-navy outline-none focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-550 text-red-500 mt-1 text-left font-bold">❌ Passwords do not match</p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-emerald-600 mt-1 text-left font-bold">✓ Passwords match</p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Action Row */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-light-border/40 mt-2">
              <button
                type="button"
                onClick={() => {
                  if (isAdmin) {
                    navigate("/admin");
                  } else {
                    navigate("/");
                  }
                }}
                className="px-5 py-2 border border-light-border hover:bg-slate-50 text-muted-gray text-xs font-bold rounded-xl transition h-[38px] cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition h-[38px] disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
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
            <div className="py-16 flex flex-col items-center justify-center bg-white border border-light-border/60 rounded-3xl shadow-2xs">
              <Loader2 className="animate-spin text-primary w-8 h-8 mb-3" />
              <p className="text-xs text-muted-gray font-semibold uppercase tracking-wider animate-pulse">
                Fetching Order History...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center bg-white border border-light-border/60 rounded-3xl shadow-2xs px-6 flex flex-col items-center">
              <ShoppingBag size={42} className="text-muted-gray/50 mb-4" strokeWidth={2.5} />
              <h3 className="text-base font-extrabold text-dark-navy">No Orders Placed Yet</h3>
              <p className="text-xs text-muted-gray mt-1.5 max-w-xs leading-relaxed font-semibold">
                When you make purchases via our secure checkout gateway, your orders will appear here.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="mt-5 px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer outline-none active:scale-95"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4.5">
              {/* Status Pills Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2.5 scrollbar-none border-b border-light-border/60">
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
                      className={`px-4.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border cursor-pointer ${
                        isActive
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 text-muted-gray border-light-border/40 hover:text-dark-navy hover:bg-slate-100"
                      }`}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>

              {orders.filter(o => userOrderStatusFilter === "All" || o.orderStatus === userOrderStatusFilter).length === 0 ? (
                <div className="py-12 text-center bg-white border border-light-border/60 rounded-3xl shadow-2xs px-6">
                  <SlidersHorizontal size={30} className="text-muted-gray/50 mx-auto mb-3" />
                  <h3 className="text-sm font-extrabold text-dark-navy">No Matching Orders</h3>
                  <p className="text-xs text-muted-gray mt-1 font-semibold">
                    You have no orders currently in the "{userOrderStatusFilter}" status.
                  </p>
                </div>
              ) : (
                orders
                  .filter(o => userOrderStatusFilter === "All" || o.orderStatus === userOrderStatusFilter)
                  .map((order) => (
                <div
                  key={order._id}
                  className="bg-white border border-light-border/60 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4 text-left relative overflow-hidden w-full min-w-0"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-100"></div>

                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-light-border/40 pb-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 min-w-0">
                        <span className="text-[9px] text-muted-gray block font-bold uppercase tracking-widest flex-shrink-0">
                          Order Reference
                        </span>
                        <span className="text-xs font-extrabold text-dark-navy">
                          #{order._id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-gray mt-0.5 font-semibold">
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
                      className={`px-3 py-1 text-xs font-bold rounded-full border self-start sm:self-auto ${getOrderStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Products purchased in the order */}
                  <div className="divide-y divide-light-border/20">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-start">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-contain bg-soft-bg border border-light-border/30 p-0.5 rounded-xl flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-dark-navy truncate">
                            {item.name}
                          </h4>
                          <div className="flex justify-between items-center mt-1 text-xs text-muted-gray font-semibold">
                            <span>Qty: {item.quantity}</span>
                            <span className="font-extrabold text-dark-navy">₹{item.price.toLocaleString()} each</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details Footer */}
                  <div className="pt-4 border-t border-light-border/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-muted-gray bg-soft-bg/85 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-b-3xl">
                    
                    {/* Shipping Address Summary */}
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] text-muted-gray block font-bold uppercase tracking-widest">
                        Shipping Address
                      </span>
                      <div className="text-[11px] text-muted-gray leading-normal flex items-start gap-1 font-semibold">
                        <MapPin size={12} className="text-muted-gray/80 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-dark-navy">{order.shippingAddress.address}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Cost & Transaction Metadata */}
                    <div className="space-y-1.5 md:text-right flex flex-col md:items-end justify-between min-w-0">
                      <div className="w-full flex justify-between md:justify-end gap-3 items-center min-w-0">
                        <span className="text-[9px] text-muted-gray font-bold uppercase tracking-widest flex-shrink-0">
                          Transaction ID
                        </span>
                        <span className="font-mono text-[11px] text-dark-navy block select-all truncate text-right max-w-[170px] sm:max-w-none">
                          {order.transactionId}
                        </span>
                      </div>
                      <div className="w-full flex justify-between md:justify-end gap-3 items-center pt-1.5">
                        <span className="text-[11px] text-dark-navy font-extrabold uppercase tracking-wider">Total Paid:</span>
                        <span className="text-base font-black text-primary">
                          ₹{order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      )}

      {/* RENDER TAB 3: ADDRESS BOOK */}
      {activeTab === "addresses" && (
        <div className="space-y-4 text-left">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-soft-bg border border-light-border/60 p-4 rounded-3xl">
            <div>
              <h3 className="text-sm font-extrabold text-dark-navy flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin size={15} className="text-primary" />
                Your Saved Addresses
              </h3>
              <p className="text-xs text-muted-gray mt-1 font-semibold">
                You have saved <span className="font-extrabold text-primary">{addresses.length}/10</span> addresses.
              </p>
            </div>
            {!showAddressForm && (
              <button
                type="button"
                onClick={() => {
                  if (addresses.length >= 10) {
                    showToast("You can save up to 10 addresses only.", "error");
                    return;
                  }
                  setEditingAddressId(null);
                  setAddressForm({ streetAddress: "", city: "", state: "", pinCode: "", country: "India" });
                  setShowAddressForm(true);
                }}
                disabled={addresses.length >= 10}
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-center disabled:opacity-50 cursor-pointer transition active:scale-95"
              >
                Add New Address
              </button>
            )}
          </div>

          {/* Form to Add/Edit Address */}
          {showAddressForm && (
            <div className="bg-white border border-light-border/60 rounded-3xl p-5 md:p-6 shadow-2xs relative overflow-hidden animate-fadeIn">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
              <h4 className="text-xs font-extrabold text-dark-navy uppercase tracking-wider mb-4">
                {editingAddressId ? "Modify Saved Address" : "Add New Address"}
              </h4>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">Street Address (Flat/House No., Colony)</label>
                  <input
                    type="text"
                    id="profile-street"
                    name="street-address"
                    autoComplete="street-address"
                    required
                    value={addressForm.streetAddress}
                    onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy transition-all h-[38px] bg-white"
                    placeholder="E.g., Flat 405, Block B, Green Heights"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="profile-city" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">Town / City</label>
                    <input
                      type="text"
                      id="profile-city"
                      name="city"
                      autoComplete="address-level2"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy transition-all h-[38px] bg-white"
                      placeholder="E.g., Bengaluru"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="profile-state" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">State / Province</label>
                    <input
                      type="text"
                      id="profile-state"
                      name="state"
                      autoComplete="address-level1"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full px-3 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy transition-all h-[38px] bg-white"
                      placeholder="E.g., Karnataka"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="profile-pincode" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">PIN / Postal Code</label>
                    <input
                      type="text"
                      id="profile-pincode"
                      name="pincode"
                      autoComplete="postal-code"
                      required
                      maxLength="6"
                      value={addressForm.pinCode}
                      onChange={(e) => setAddressForm({ ...addressForm, pinCode: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-3 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy transition-all h-[38px] bg-white"
                      placeholder="E.g., 560001"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="profile-country" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">Country</label>
                    <input
                      type="text"
                      id="profile-country"
                      name="country"
                      autoComplete="country-name"
                      required
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full px-3 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy transition-all h-[38px] bg-white"
                      placeholder="E.g., India"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-light-border/40">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                    }}
                    className="px-4 py-2 border border-light-border hover:bg-slate-50 text-muted-gray text-xs font-bold rounded-xl transition h-[38px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition h-[38px] disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {submitting ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Saved Addresses list */}
          {loadingAddresses ? (
            <div className="py-16 flex flex-col items-center justify-center bg-white border border-light-border/60 rounded-3xl shadow-2xs">
              <Loader2 className="animate-spin text-primary w-8 h-8 mb-3" />
              <p className="text-xs text-muted-gray font-semibold uppercase tracking-wider animate-pulse">
                Loading Addresses...
              </p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="py-16 text-center bg-white border border-light-border/60 rounded-3xl shadow-2xs px-6">
              <MapPin size={42} className="text-muted-gray/50 mx-auto mb-4" strokeWidth={2.5} />
              <h3 className="text-base font-extrabold text-dark-navy">No Saved Addresses</h3>
              <p className="text-xs text-muted-gray mt-1 max-w-xs mx-auto leading-relaxed font-semibold">
                Add your billing or shipping addresses here to reuse them seamlessly during checkout.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.005)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.01)] transition-all duration-300 flex flex-col justify-between gap-3 text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-light-border/30"></div>
                  <div className="space-y-2">
                    <span className="text-[9px] text-muted-gray block font-bold uppercase tracking-widest">
                      Address Details
                    </span>
                    <div className="text-xs font-semibold text-muted-gray leading-normal flex items-start gap-1">
                      <MapPin size={12} className="text-muted-gray/80 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-extrabold text-dark-navy">{addr.streetAddress}</p>
                        <p className="mt-0.5">
                          {addr.city}, {addr.state} - {addr.pinCode}
                        </p>
                        <p className="text-primary mt-1 text-[9px] uppercase font-extrabold tracking-wider">{addr.country}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2.5 border-t border-light-border/40">
                    <button
                      type="button"
                      onClick={() => handleEditAddressClick(addr)}
                      className="text-primary hover:text-primary-hover text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddressClick(addr._id)}
                      className="text-red-500 hover:text-red-650 text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
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
