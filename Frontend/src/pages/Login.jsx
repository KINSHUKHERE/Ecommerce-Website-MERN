import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, googleLogin } from "../api/AuthApi";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
    setIsLoggingIn(true);
    setError("");

    try {
      const response = await login(formData);
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
      setError(
        err.response?.data?.msg || "Unable to Login. Please try again later.",
      );
      console.log("Unable to Login!!");
      setIsLoggingIn(false);
    }
  };

  // Google OAuth integration
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoggingIn(true);
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
      setError("Google Login Failed");
      setIsLoggingIn(false);
    }
  };

  const handleGoogleError = () => {
    console.log("Google Login Failed");
    setError("Google Login Failed");
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-100 flex items-center justify-center px-4 relative">
      {isLoggingIn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-all duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-xs w-full mx-4 border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#15877F] mb-4"></div>
            <p className="text-gray-900 font-bold text-lg text-center">Authenticating</p>
            <p className="text-gray-500 text-sm text-center mt-1">Please wait while we secure your session...</p>
          </div>
        </div>
      )}
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-[#15877F] mb-2">
          Welcome Back
        </h1>
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-center text-sm font-medium text-red-600">
              ❌ {error}
            </p>
          </div>
        )}
        <p className="text-center text-gray-500 mb-6">
          Login to your YoCart account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
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

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-[#15877F] hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#15877F] text-white py-3 rounded-lg font-semibold hover:bg-[#126b64] transition"
          >
            Log In
          </button>

          <div className="my-5 flex items-center">
            <div className="flex-1 border-t"></div>
            <span className="px-3 text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
            />
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#15877F] font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
