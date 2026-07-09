import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpApi, googleLogin, uploadAvatarApi } from "../api/AuthApi";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Loader2, User, ArrowLeft } from "lucide-react";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    phoneNumber: "",
    email: "",
    password: "",
    avatar: "",
    businessName: "",
    businessAddress: "",
    gstin: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    role: "",
    phoneNumber: "",
    email: "",
    password: "",
    businessName: "",
    businessAddress: "",
    gstin: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [vendorSuccess, setVendorSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("role");
    if (r === "user" || r === "vendor") {
      setFormData((prev) => ({ ...prev, role: r }));
    }
  }, []);

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
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
      alert(err.response?.data?.msg || "Failed to upload profile image");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({
      name: "",
      role: "",
      phoneNumber: "",
      email: "",
      password: "",
      businessName: "",
      businessAddress: "",
      gstin: "",
      general: "",
    });

    // Client-side validations
    let hasErrors = false;
    const newErrors = {
      name: "",
      role: "",
      phoneNumber: "",
      email: "",
      password: "",
      businessName: "",
      businessAddress: "",
      gstin: "",
      general: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
      hasErrors = true;
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Full name must be at least 3 characters.";
      hasErrors = true;
    }

    if (!formData.role) {
      newErrors.role = "Please select an account type.";
      hasErrors = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
      hasErrors = true;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
      hasErrors = true;
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
      hasErrors = true;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      hasErrors = true;
    }

    if (formData.role === "vendor") {
      if (!formData.businessName.trim()) {
        newErrors.businessName = "Business name is required.";
        hasErrors = true;
      }
      if (!formData.gstin.trim()) {
        newErrors.gstin = "GSTIN is required.";
        hasErrors = true;
      } else if (formData.gstin.trim().length !== 15) {
        newErrors.gstin = "GSTIN must be exactly 15 characters.";
        hasErrors = true;
      }
      if (!formData.businessAddress.trim()) {
        newErrors.businessAddress = "Business address is required.";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await signUpApi(formData);
      setIsSubmitting(false);
      if (formData.role === "vendor") {
        setVendorSuccess(true);
      } else {
        navigate("/login");
      }
    } catch (err) {
      const errMsg = err.response?.data?.msg || "Unable to create user";
      const updatedErrors = {
        name: "",
        role: "",
        phoneNumber: "",
        email: "",
        password: "",
        businessName: "",
        businessAddress: "",
        gstin: "",
        general: "",
      };

      if (errMsg.toLowerCase().includes("exist") || errMsg.toLowerCase().includes("registered")) {
        updatedErrors.email = "This email is already registered.";
      } else {
        updatedErrors.general = errMsg;
      }
      setErrors(updatedErrors);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, general: "" }));
    try {
      const response = await googleLogin({
        token: credentialResponse.credential,
      });

      const user = response.data.user;
      const token = response.data.token;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "vendor") {
        navigate("/vendor");
      } else if (user.isProfileComplete === false) {
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: "Google Sign Up Failed" }));
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setErrors((prev) => ({ ...prev, general: "Google Sign Up Failed" }));
    setIsSubmitting(false);
  };

  if (vendorSuccess) {
    return (
      <div className="min-h-screen w-full bg-soft-bg/40 flex items-center justify-center px-6 py-12 text-dark-navy antialiased">
        <div className="w-full max-w-md bg-white border border-light-border/60 shadow-lg rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent"></div>
          
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2050/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-dark-navy tracking-tight mb-3">
            Registration Successful!
          </h2>
          <p className="text-xs sm:text-sm text-muted-gray leading-relaxed font-semibold mb-6">
            Your application is completed. Please wait until the administrator accepts your seller request.
          </p>

          <Link
            to="/login"
            className="w-full py-2.5 bg-gradient-to-r from-primary to-accent text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-soft-bg/40 flex items-center justify-center px-6 py-12 text-dark-navy antialiased">
      {isSubmitting && (
        <div className="fixed inset-0 bg-[#0F172A]/30 backdrop-blur-xs z-50 flex flex-col items-center justify-center animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-sm w-[90%] mx-auto border border-light-border/40 text-center animate-scaleUp">
            <div className="relative flex items-center justify-center mb-5">
              <div className="absolute w-12 h-12 bg-primary/10 rounded-full animate-ping"></div>
              <Loader2 className="animate-spin text-primary relative z-10 w-8 h-8" />
            </div>
            <h3 className="text-dark-navy font-extrabold text-base tracking-tight">Creating your profile</h3>
            <p className="text-muted-gray text-xs mt-1.5 font-semibold px-4">We're setting up your personalized shopping workspace...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white border border-light-border/60 shadow-2xs rounded-3xl p-8">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest hover:text-primary transition-colors duration-200 mb-6 group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-dark-navy tracking-tight mb-1">
          Create Account
        </h1>
        <p className="text-center text-xs text-muted-gray mb-6 font-semibold">Join YoCart today</p>

        {errors.general && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-red-600">
              ❌ {errors.general}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Name */}
          <div>
            <label htmlFor="signupName" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Full Name</label>

            <input
              type="text"
              id="signupName"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white ${
                errors.name ? "border-red-500" : "border-light-border"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1">
                ⚠️ {errors.name}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="signupRole" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
              Account Type
            </label>

            <select
              id="signupRole"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white cursor-pointer ${
                errors.role ? "border-red-500" : "border-light-border"
              }`}
            >
              <option value="">Select Account Type</option>
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1">
                ⚠️ {errors.role}
              </p>
            )}
          </div>

          {formData.role === "vendor" && (
            <>
              {/* Business Name */}
              <div>
                <label htmlFor="signupBusinessName" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Business Name</label>
                <input
                  type="text"
                  id="signupBusinessName"
                  name="businessName"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter business/store name"
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white ${
                    errors.businessName ? "border-red-500" : "border-light-border"
                  }`}
                />
                {errors.businessName && (
                  <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1">
                    ⚠️ {errors.businessName}
                  </p>
                )}
              </div>

              {/* GSTIN */}
              <div>
                <label htmlFor="signupGstin" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">GSTIN / TAX ID</label>
                <input
                  type="text"
                  id="signupGstin"
                  name="gstin"
                  required
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="Enter GSTIN ID number"
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white ${
                    errors.gstin ? "border-red-500" : "border-light-border"
                  }`}
                />
                {errors.gstin && (
                  <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1">
                    ⚠️ {errors.gstin}
                  </p>
                )}
              </div>

              {/* Business Address */}
              <div>
                <label htmlFor="signupBusinessAddress" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Business Address</label>
                <textarea
                  id="signupBusinessAddress"
                  name="businessAddress"
                  required
                  rows="3"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  placeholder="Enter business address"
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white resize-none ${
                    errors.businessAddress ? "border-red-500" : "border-light-border"
                  }`}
                />
                {errors.businessAddress && (
                  <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1">
                    ⚠️ {errors.businessAddress}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Phone Number */}
          <div>
            <label htmlFor="signupPhoneNumber" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
              Phone Number
            </label>

            <input
              type="tel"
              id="signupPhoneNumber"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
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

          {/* Email */}
          <div>
            <label htmlFor="signupEmail" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
              Email Address
            </label>

            <input
              type="email"
              id="signupEmail"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white ${
                errors.email ? "border-red-500" : "border-light-border"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-[11px] font-bold mt-1.5 ml-1">
                ⚠️ {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signupPassword" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="signupPassword"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="new-password"
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
                    htmlFor="signup-avatar-input" 
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
                    id="signup-avatar-input" 
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />

                  {formData.avatar && (
                    <button 
                      type="button" 
                      onClick={handleRemoveAvatar} 
                      className="text-xs font-bold text-red-500 hover:text-red-650 py-1 px-3 bg-red-50 rounded-lg cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition duration-300 cursor-pointer active:scale-95"
          >
            Sign Up
          </button>

          <div className="my-5 flex items-center select-none">
            <div className="flex-1 border-t border-light-border/60"></div>
            <span className="px-3 text-xs text-muted-gray font-bold">OR</span>
            <div className="flex-1 border-t border-light-border/60"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              text="signup_with"
            />
          </div>
        </form>

        <p className="text-center text-xs text-muted-gray font-semibold mt-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-bold hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
