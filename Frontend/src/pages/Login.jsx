import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, googleLogin } from "../api/AuthApi";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { SmoothInput } from "../components/SmoothInput";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

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
    setIsLoggingIn(true);
    setErrors({ email: "", password: "", general: "" });

    // Client-side validations
    let hasErrors = false;
    const newErrors = { email: "", password: "", general: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
      hasErrors = true;
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      setIsLoggingIn(false);
      return;
    }

    try {
      const response = await login(formData);
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
      const errMsg = err.response?.data?.msg || "Unable to Login. Please try again later.";
      
      const updatedErrors = { email: "", password: "", general: "" };
      if (errMsg.toLowerCase().includes("email") || errMsg.toLowerCase().includes("signup") || errMsg.toLowerCase().includes("register")) {
        updatedErrors.email = errMsg;
      } else if (errMsg.toLowerCase().includes("password") || errMsg.toLowerCase().includes("incorrect")) {
        updatedErrors.password = errMsg;
      } else {
        updatedErrors.general = errMsg;
      }
      setErrors(updatedErrors);
      setIsLoggingIn(false);
    }
  };

  // Google OAuth integration
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoggingIn(true);
    setErrors({ email: "", password: "", general: "" });
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
      setErrors({ email: "", password: "", general: "Google Login Failed" });
      setIsLoggingIn(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ email: "", password: "", general: "Google Login Failed" });
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen w-full bg-soft-bg/40 flex items-center justify-center px-6 py-12 text-dark-navy antialiased">
      {isLoggingIn && (
        <div className="fixed inset-0 bg-[#0F172A]/30 backdrop-blur-xs z-50 flex flex-col items-center justify-center animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-sm w-[90%] mx-auto border border-light-border/40 text-center animate-scaleUp">
            <div className="relative flex items-center justify-center mb-5">
              <div className="absolute w-12 h-12 bg-primary/10 rounded-full animate-ping"></div>
              <Loader2 className="animate-spin text-primary relative z-10 w-8 h-8" />
            </div>
            <h3 className="text-dark-navy font-extrabold text-base tracking-tight">Signing you in</h3>
            <p className="text-muted-gray text-xs mt-1.5 font-semibold px-4">Welcome back! Preparing your premium shopping experience...</p>
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
          Welcome Back
        </h1>
        <p className="text-center text-xs text-muted-gray mb-6 font-semibold">
          Login to your YoCart account
        </p>

        {errors.general && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-red-600">
              ❌ {errors.general}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label htmlFor="loginEmail" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
              Email Address
            </label>

            <SmoothInput
              type="email"
              id="loginEmail"
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

          <div>
            <label htmlFor="loginPassword" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Password</label>

            <div className="relative">
              <SmoothInput
                type={showPassword ? "text" : "password"}
                id="loginPassword"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
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

          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-primary font-bold hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition duration-300 cursor-pointer active:scale-95"
          >
            Log In
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
            />
          </div>
        </form>

        <p className="text-center text-xs text-muted-gray font-semibold mt-8">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary font-bold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
