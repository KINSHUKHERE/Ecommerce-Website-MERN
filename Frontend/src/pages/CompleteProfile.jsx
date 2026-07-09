import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { completeProfile, uploadAvatarApi } from "../api/AuthApi";
import { Eye, EyeOff, Loader2, User } from "lucide-react";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  });

  const [formData, setFormData] = useState(() => {
    return {
      phoneNumber: user?.phoneNumber || "",
      password: "",
      confirmPassword: "",
      avatar: user?.avatar || "",
    };
  });
  const [errors, setErrors] = useState({
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else if (user.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (user.role === "vendor") {
      navigate("/vendor", { replace: true });
    } else if (user.isProfileComplete) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, general: "Image size must be less than 2MB" }));
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await uploadAvatarApi(file);
      setFormData((prev) => ({
        ...prev,
        avatar: res.data.url,
      }));
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        general: err.response?.data?.msg || "Failed to upload profile image",
      }));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));
  };

  const isInputSufficient = () => {
    const isPhoneValid = /^[0-9]{10}$/.test(formData.phoneNumber.trim());
    if (!isPhoneValid) return false;

    if (formData.password) {
      if (formData.password.length < 6) return false;
      if (formData.password !== formData.confirmPassword) return false;
    }

    return true;
  };

  const handleSetupLater = () => {
    sessionStorage.setItem("profileSetupDeferred", "true");
    navigate("/", { replace: true });
  };

  const handleChange = (e) => {
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
      general: "",
    }));
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      general: "",
    });

    let hasErrors = false;
    const newErrors = {
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      general: "",
    };

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
      hasErrors = true;
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
        hasErrors = true;
      }
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters.";
        hasErrors = true;
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        phoneNumber: formData.phoneNumber,
        avatar: formData.avatar,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await completeProfile(payload);
      const updatedUser = response.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.msg || "Failed to complete profile. Please try again.";
      const updatedErrors = {
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        general: "",
      };
      if (errMsg.toLowerCase().includes("phone")) {
        updatedErrors.phoneNumber = errMsg;
      } else if (errMsg.toLowerCase().includes("password")) {
        updatedErrors.password = errMsg;
      } else {
        updatedErrors.general = errMsg;
      }
      setErrors(updatedErrors);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.isProfileComplete) {
    return null;
  }

  return (
    <div className="min-h-screen bg-soft-bg/40 flex items-center justify-center px-6 py-12 text-dark-navy antialiased">
      <div className="w-full max-w-md bg-white border border-light-border/60 shadow-2xs rounded-3xl p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-dark-navy tracking-tight mb-1">
          Complete Profile
        </h1>
        <p className="text-center text-xs text-muted-gray mb-6 font-semibold">
          Welcome, {user.name}! Just one last step to complete your profile.
        </p>

        {errors.general && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-red-655">
              ❌ {errors.general}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Phone Number */}
          <div>
            <label className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white ${
                errors.phoneNumber ? "border-red-500" : "border-light-border"
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1">
                ⚠️ {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Profile Picture (Optional) */}
          <div>
            <label className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-2">Profile Picture <span className="text-muted-gray font-normal lowercase tracking-normal text-xs">(Optional)</span></label>
            
            <div className="flex items-center gap-4 p-3 border border-dashed border-light-border rounded-2xl bg-soft-bg/50">
              <div className="relative flex-shrink-0">
                {formData.avatar ? (
                  <img 
                    src={formData.avatar} 
                    alt="Avatar Preview" 
                    className="w-14 h-14 rounded-full object-cover border border-light-border/40" 
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-100 border border-light-border/30 flex items-center justify-center text-muted-gray">
                    <User size={24} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-gray mb-2 font-semibold">Upload a profile picture to personalize your account</p>
                <div className="flex items-center gap-2">
                  <label 
                    htmlFor="complete-avatar-input" 
                    className="cursor-pointer text-xs font-bold text-primary hover:text-primary-hover py-1 px-3 bg-white border border-light-border rounded-lg shadow-2xs inline-flex items-center gap-1.5"
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <span>Choose File</span>
                    )}
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="complete-avatar-input" 
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />

                  {formData.avatar && (
                    <button 
                      type="button" 
                      onClick={handleRemoveAvatar} 
                      className="text-xs font-bold text-red-500 hover:text-red-655 py-1 px-3 bg-red-50 rounded-lg cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-light-border/60 my-4 pt-4">
            <h2 className="text-xs font-extrabold text-dark-navy uppercase tracking-wider mb-2">
              Set a Password (Optional)
            </h2>
            <p className="text-[10px] text-muted-gray mb-4 font-semibold">
              Setting a password allows you to log in with your email address and password, in addition to using Google.
            </p>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password (optional)"
                  className={`w-full border rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white ${
                    errors.password ? "border-red-500" : "border-light-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray hover:text-dark-navy cursor-pointer outline-none focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1">
                  ⚠️ {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            {formData.password && (
              <div>
                <label className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
                  Confirm Password <span className="text-red-555">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required={!!formData.password}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`w-full border rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white ${
                      errors.confirmPassword ? "border-red-500" : "border-light-border"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray hover:text-dark-navy cursor-pointer outline-none focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1">
                    ⚠️ {errors.confirmPassword}
                  </p>
                )}
                {formData.confirmPassword && !errors.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 font-bold">❌ Passwords do not match</p>
                )}
                {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-emerald-600 mt-1.5 font-bold">✓ Passwords match</p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !isInputSufficient()}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer outline-none active:scale-95"
            >
              {loading ? "Saving..." : "Complete Setup"}
            </button>
            <button
              type="button"
              onClick={handleSetupLater}
              className="flex-1 py-3 border border-light-border hover:bg-slate-50 text-muted-gray rounded-xl font-bold text-xs uppercase tracking-wider transition text-center cursor-pointer outline-none active:scale-95"
            >
              Setup Later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
