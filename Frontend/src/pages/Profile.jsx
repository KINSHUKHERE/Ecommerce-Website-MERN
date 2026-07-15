import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserProfile, updateProfile, uploadAvatarApi } from "../api/AuthApi";
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
  EyeOff
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
  }, [navigate]);

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

  return (
    <div className={`w-full max-w-2xl mx-auto text-dark-navy antialiased ${isDashboardUser ? "mt-4 px-4 sm:px-0" : "my-12 px-6"}`}>
      
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
      <div className="mb-6 flex justify-between items-start text-left animate-fadeIn">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-navy tracking-tight leading-normal">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-gray mt-1.5 font-medium leading-relaxed">
            Manage your personal information and security credentials.
          </p>
        </div>
      </div>

      <div className="bg-white border border-light-border/60 rounded-3xl p-5 md:p-6 shadow-2xs relative overflow-hidden animate-fadeIn">
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
                    className="text-[11px] font-bold text-red-500 hover:text-red-655 transition-colors py-1 px-3 bg-red-50 rounded-lg shadow-2xs cursor-pointer"
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
                  Business / Store Address
                </label>
                <textarea
                  id="profile-biz-address"
                  name="businessAddress"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full px-3.5 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[80px] resize-y py-2.5"
                  placeholder="Enter business store address"
                  required
                />
              </div>
            </>
          )}

          {/* Password Change Toggle */}
          <div className="pt-3 border-t border-light-border/40">
            <button
              type="button"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="text-[11px] font-extrabold text-primary hover:text-primary-hover uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              {showPasswordFields ? "Cancel Password Change" : "Change Password"}
            </button>
          </div>

          {/* Password Fields */}
          {showPasswordFields && (
            <>
              {/* New Password field */}
              <div className="flex flex-col gap-1.5 text-left animate-fadeIn">
                <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                  New Password <span className="text-red-555">*</span>
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
                    placeholder="Enter new password (min. 6 chars)"
                    required
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
            </>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-light-border/40 mt-2">
            <button
              type="button"
              onClick={() => {
                if (isAdmin) {
                  navigate("/admin");
                } else if (role === "vendor") {
                  navigate("/vendor");
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

    </div>
  );
};

export default Profile;
