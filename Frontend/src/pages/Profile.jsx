import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateProfile } from "../api/AuthApi";
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // User details state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toast notifications
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const localUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!localUser || !localUser._id) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await getUserProfile(localUser._id);
        const data = res.data;
        setName(data.name || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phoneNumber || "");
        setRole(data.role || "user");
      } catch (err) {
        console.error("Failed to load user profile:", err);
        showToast("Failed to load profile details", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setMessage("");
    }, 3000);
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
      const res = await updateProfile(localUser._id, {
        name: name.trim(),
        password: password ? password : undefined,
      });

      const updatedUser = res.data.user;

      // Update local storage values
      const newLocalStorageUser = {
        ...localUser,
        name: updatedUser.name,
      };
      localStorage.setItem("user", JSON.stringify(newLocalStorageUser));

      // Dispatch event to trigger navbar re-render
      window.dispatchEvent(new Event("storage"));

      showToast("Profile updated successfully", "success");
      setPassword("");
      setConfirmPassword("");

      // Optional: Redirect back after 1.5 seconds
      setTimeout(() => {
        if (updatedUser.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1500);

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

  return (
    <div className={`max-w-xl mx-auto ${isAdmin ? "mt-4" : "my-12 px-4 md:px-0"}`}>
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
          Account Settings
        </h1>
        <p className="text-[13px] font-normal text-gray-500 mt-1 leading-relaxed">
          Update your public profile details and password security settings.
        </p>
      </div>

      {/* Profile Card */}
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
          <div className="flex flex-col gap-1.5">
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
                className="w-full pl-9 pr-4 py-2 border border-slate-100 rounded-lg focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all h-[38px]"
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          {/* Email field (Read-Only) */}
          <div className="flex flex-col gap-1.5">
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
                className="w-full pl-9 pr-4 py-2 border border-slate-100 rounded-lg bg-slate-50 text-gray-400 text-sm font-normal cursor-not-allowed h-[38px] select-none"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                <Lock size={13} />
              </span>
            </div>
          </div>

          {/* Phone Number field (Read-Only) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[13px] font-normal text-gray-500">
                Phone Number
              </label>
              <span className="text-[11px] text-gray-450 font-normal select-none">
                Not editable
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                <Phone size={15} />
              </span>
              <input
                type="tel"
                value={phoneNumber}
                disabled
                className="w-full pl-9 pr-4 py-2 border border-slate-100 rounded-lg bg-slate-50 text-gray-400 text-sm font-normal cursor-not-allowed h-[38px] select-none"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                <Lock size={13} />
              </span>
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-normal text-gray-500">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                <Lock size={15} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-slate-100 rounded-lg focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all h-[38px]"
                placeholder="Leave blank to keep current"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password field */}
          {password && (
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              <label className="text-[13px] font-normal text-gray-500">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                  <Lock size={15} />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-slate-100 rounded-lg focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all h-[38px]"
                  placeholder="Re-enter new password"
                  required={!!password}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
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
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-gray-700 text-sm font-medium rounded-lg transition-all h-[38px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#088178] hover:bg-[#088178]/90 text-white text-sm font-medium rounded-lg shadow-sm transition-all h-[38px] disabled:opacity-50"
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
    </div>
  );
};

export default Profile;
