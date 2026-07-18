import { useEffect, useState } from "react";
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
import { SmoothInput } from "../components/SmoothInput";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Toggle views
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [hasPassword, setHasPassword] = useState(true);
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
      showToast("Image uploaded successfully! Press Save to apply.", "success");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to upload image", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    showToast("Profile image removed. Press Save to apply.", "success");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (isEditingProfile) {
      if (!name.trim()) {
        showToast("Name field is required", "error");
        return;
      }
    }

    if (isChangingPassword) {
      if (!password || password.length < 6) {
        showToast("Password must be at least 6 characters long", "error");
        return;
      }

      if (password !== confirmPassword) {
        showToast("Passwords do not match", "error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const isVendor = role === "vendor";
      const payload = {};

      if (isEditingProfile) {
        payload.name = name.trim();
        payload.phoneNumber = phoneNumber.trim();
        payload.avatar = avatar;
        if (isVendor) {
          payload.businessName = businessName.trim();
          payload.businessAddress = businessAddress.trim();
          payload.gstin = gstin.trim();
        }
      }

      if (isChangingPassword) {
        payload.password = password;
      }

      const res = await updateProfile(payload);
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

      showToast(
        isChangingPassword ? "Password updated successfully" : "Profile updated successfully",
        "success"
      );

      // Reset states
      setIsEditingProfile(false);
      setIsChangingPassword(false);
      setPassword("");
      setConfirmPassword("");

    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to save changes", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 bg-soft-bg/30">
        <Loader2 className="animate-spin text-[#15877F] w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">
          Loading profile details...
        </p>
      </div>
    );
  }

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
            View your account information and manage settings.
          </p>
        </div>
      </div>

      {/* Profile Header (Read-Only Information Card) */}
      <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs relative overflow-hidden animate-fadeIn mb-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#15877F]"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative">
            {avatar ? (
              <img 
                src={avatar} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full object-cover border border-[#15877F]/20 bg-slate-50 shadow-inner" 
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-100 border border-light-border/40 flex items-center justify-center text-muted-gray font-extrabold text-lg select-none">
                {name ? name.charAt(0).toUpperCase() : <User size={28} />}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl font-black text-dark-navy tracking-tight">{name || "Your Name"}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#15877F]/5 text-[#15877F] border border-[#15877F]/10 uppercase tracking-widest select-none">
                <Shield size={10} />
                {role}
              </span>
            </div>
            
            <div className="mt-3 space-y-1.5 text-xs font-semibold text-muted-gray">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Mail size={13} className="text-muted-gray/80" />
                <span>{email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Phone size={13} className="text-muted-gray/80" />
                <span>{phoneNumber || "Not set"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Views: Edit Form, Password Form, or List of Action Cards */}
      {isEditingProfile ? (
        /* Edit Profile Details Form */
        <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs relative overflow-hidden animate-fadeIn mb-6 animate-slideDown">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#15877F]"></div>
          
          <h3 className="text-sm font-black text-dark-navy mb-5 text-left flex items-center gap-2">
            <span>✏️</span> Edit Profile Details
          </h3>

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Avatar Selector in Edit View */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-light-border/40 mb-3 text-left">
              <div className="relative">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover border border-[#15877F]/20 bg-slate-50 shadow-inner" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-light-border/40 flex items-center justify-center text-muted-gray font-extrabold text-sm select-none">
                    {name ? name.charAt(0).toUpperCase() : <User size={20} />}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center sm:items-start gap-1">
                <span className="text-xs font-extrabold text-dark-navy uppercase tracking-wider">Profile Picture</span>
                <p className="text-[10px] text-muted-gray text-center sm:text-left font-semibold">JPG, PNG or WEBP. Max 2MB.</p>
                
                <div className="flex items-center gap-2 mt-1">
                  <label 
                    htmlFor="avatar-input" 
                    className="cursor-pointer text-[10px] font-bold text-[#15877F] hover:text-white py-1 px-3 bg-[#15877F]/5 hover:bg-[#15877F] border border-[#15877F]/10 rounded-lg flex items-center gap-1 transition-all"
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 size={10} className="animate-spin" />
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
                      className="text-[10px] font-bold text-red-550 hover:text-red-700 transition-colors py-1 px-3 bg-red-50 rounded-lg cursor-pointer"
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
                <SmoothInput
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-[#15877F]/5 focus:border-[#15877F] outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            {/* Email field (Read-Only) */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
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
                <SmoothInput
                  type="email"
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
              <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                  <Phone size={15} />
                </span>
                <SmoothInput
                  type="tel"
                  name="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-[#15877F]/5 focus:border-[#15877F] outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {role === "vendor" && (
              <>
                {/* Business Name */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                    Business / Store Name
                  </label>
                  <SmoothInput
                    type="text"
                    name="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-[#15877F]/5 focus:border-[#15877F] outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                    placeholder="Enter business name"
                    required
                  />
                </div>

                {/* GSTIN */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                    GSTIN / Tax ID
                  </label>
                  <SmoothInput
                    type="text"
                    name="gstin"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full px-3.5 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-[#15877F]/5 focus:border-[#15877F] outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                    placeholder="Enter GSTIN"
                    required
                  />
                </div>

                {/* Business Address */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                    Business / Store Address
                  </label>
                  <textarea
                    name="businessAddress"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full px-3.5 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-[#15877F]/5 focus:border-[#15877F] outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[80px] resize-y py-2.5"
                    placeholder="Enter business store address"
                    required
                  />
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3.5 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 h-11 bg-[#15877F] hover:bg-[#15877F]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-5 h-11 border border-slate-200 text-muted-gray hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : isChangingPassword ? (
        /* Change Password Form */
        <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xs relative overflow-hidden animate-fadeIn mb-6 animate-slideDown">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#15877F]"></div>
          
          <h3 className="text-sm font-black text-dark-navy mb-5 text-left flex items-center gap-2">
            <span>🔒</span> Change Password
          </h3>

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* New Password field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                  <Lock size={15} />
                </span>
                <SmoothInput
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-[#15877F]/5 focus:border-[#15877F] outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-gray hover:text-dark-navy outline-none focus:outline-none"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-0.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                  <Lock size={15} />
                </span>
                <SmoothInput
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-[#15877F]/5 focus:border-[#15877F] outline-none text-sm font-semibold text-dark-navy bg-white transition-all h-[38px]"
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-gray hover:text-dark-navy outline-none focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3.5 pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 h-11 bg-[#15877F] hover:bg-[#15877F]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="px-5 h-11 border border-slate-200 text-muted-gray hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Navigation Action Cards */
        <div className="space-y-3 animate-fadeIn">
          {[
            {
              label: "Edit Profile Details",
              subtitle: "Update name, profile picture, and phone number",
              icon: "✏️",
              action: () => setIsEditingProfile(true)
            },
            {
              label: "Change Password",
              subtitle: "Choose a new strong password for your account",
              icon: "🔒",
              action: () => setIsChangingPassword(true)
            },
            ...(role !== "admin" && role !== "vendor" ? [
              {
                label: "Manage Addresses",
                subtitle: "Add, edit, or remove your saved shipping addresses",
                icon: "📍",
                action: () => navigate("/addresses")
              },
              {
                label: "Recent Orders",
                subtitle: "Check order history, delivery status, and invoices",
                icon: "📦",
                action: () => navigate("/orders")
              },
              {
                label: "Wishlist Summary",
                subtitle: "View products you saved for later purchase",
                icon: "❤️",
                action: () => navigate("/wishlist")
              }
            ] : [])
          ].map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={card.action}
              className="w-full flex items-center justify-between text-left p-4.5 bg-white border border-light-border/60 hover:bg-slate-50 rounded-3xl transition-all shadow-3xs hover:shadow-2xs active:scale-[0.99] cursor-pointer group outline-none focus:outline-none"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-xl select-none">{card.icon}</span>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-[#15877F] sm:text-dark-navy leading-normal">{card.label}</h4>
                  <p className="text-[10px] text-muted-gray font-semibold mt-0.5 leading-normal truncate">{card.subtitle}</p>
                </div>
              </div>
              <span className="text-muted-gray/60 group-hover:text-dark-navy transition-colors pl-3 font-bold text-sm shrink-0 select-none">
                →
              </span>
            </button>
          ))}
        </div>
      )}

    </div>
  );
};

export default Profile;
