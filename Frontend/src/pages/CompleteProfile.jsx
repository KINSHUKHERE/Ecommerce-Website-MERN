import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { completeProfile } from "../api/AuthApi";

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
    };
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else if (user.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (user.isProfileComplete) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const isInputSufficient = () => {
    const isPhoneValid = formData.phoneNumber.trim().length >= 10;
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
    setError("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        phoneNumber: formData.phoneNumber,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await completeProfile(payload);
      const updatedUser = response.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Navigate to homepage
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.msg || "Failed to complete profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.isProfileComplete) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-[#15877F] mb-2">
          Complete Profile
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Welcome, {user.name}! Just one last step to complete your profile.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-center text-sm font-medium text-red-600">
              ❌ {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#15877F]"
            />
          </div>

          <div className="border-t my-4 pt-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Set a Password (Optional)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Setting a password allows you to log in with your email address and password, in addition to using Google.
            </p>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (optional)"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#15877F]"
              />
            </div>

            {/* Confirm Password */}
            {formData.password && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required={!!formData.password}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#15877F]"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleSetupLater}
              className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition text-center cursor-pointer outline-none focus:outline-none"
            >
              Setup Later
            </button>
            <button
              type="submit"
              disabled={loading || !isInputSufficient()}
              className="flex-1 bg-[#15877F] text-white py-3 rounded-lg font-semibold hover:bg-[#126b64] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer outline-none focus:outline-none"
            >
              {loading ? "Saving..." : "Complete Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
