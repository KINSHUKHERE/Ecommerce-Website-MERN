import React, { useDeferredValue, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpApi, googleLogin } from "../api/AuthApi";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
    <div className="min-h-[calc(100vh-80px)] bg-gray-100 flex items-center justify-center px-4 py-8 relative">
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-all duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-xs w-full mx-4 border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#15877F] mb-4"></div>
            <p className="text-gray-900 font-bold text-lg text-center">Processing Request</p>
            <p className="text-gray-500 text-sm text-center mt-1">Please wait while we secure your account details...</p>
          </div>
        </div>
      )}
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-center text-sm font-medium text-red-600">
              ❌ {error}
            </p>
          </div>
        )}
        <h1 className="text-3xl font-bold text-center text-[#15877F] mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mb-6">Join YoCart today</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>

            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#15877F]"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Account Type
            </label>

            <select
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#15877F]"
            >
              <option value="">Select Account Type</option>
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>

            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#15877F]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
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
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#15877F]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="new-password"
                className="w-full border rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#15877F]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-650 cursor-pointer outline-none focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#15877F] text-white py-3 rounded-lg font-semibold hover:bg-[#126b64] transition"
          >
            Sign Up
          </button>

          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-200"></div>
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

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#15877F] font-semibold hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
