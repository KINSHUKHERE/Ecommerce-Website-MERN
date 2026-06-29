import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpApi, googleLogin, uploadAvatarApi } from "../api/AuthApi";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Loader2, User } from "lucide-react";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    phoneNumber: "",
    email: "",
    password: "",
    avatar: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
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
    setError("");

    try {
      await signUpApi(formData);
      setIsSubmitting(false);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to create user");
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsSubmitting(true);
    setError("");
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
      } else if (user.isProfileComplete === false) {
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.log(err);
      setError("Google Sign Up Failed");
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    console.log("Google Sign Up Failed");
    setError("Google Sign Up Failed");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-soft-bg/40 flex items-center justify-center px-6 py-12 text-dark-navy antialiased">
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex flex-col items-center justify-center transition-all duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-xs w-full mx-4 border border-light-border/40">
            <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
            <p className="text-dark-navy font-bold text-base text-center">Processing Request</p>
            <p className="text-muted-gray text-xs text-center mt-1 font-semibold">Please wait while we secure your account details...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white border border-light-border/60 shadow-2xs rounded-3xl p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-dark-navy tracking-tight mb-1">
          Create Account
        </h1>
        <p className="text-center text-xs text-muted-gray mb-6 font-semibold">Join YoCart today</p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-red-600">
              ❌ {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Name */}
          <div>
            <label className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Full Name</label>

            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full border border-light-border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
              Account Type
            </label>

            <select
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-light-border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white cursor-pointer"
            >
              <option value="">Select Account Type</option>
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
              Phone Number
            </label>

            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full border border-light-border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              className="w-full border border-light-border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="new-password"
                className="w-full border border-light-border rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray hover:text-dark-navy cursor-pointer outline-none focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
