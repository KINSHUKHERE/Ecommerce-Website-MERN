import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/AuthApi";
import { Loader2, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { SmoothInput } from "../components/SmoothInput";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    general: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
    setIsSubmitting(true);
    setErrors({ password: "", confirmPassword: "", general: "" });

    let hasErrors = false;
    const newErrors = { password: "", confirmPassword: "", general: "" };

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
      hasErrors = true;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await resetPassword(token, formData.password);
      setSuccessMsg(response.data?.msg || "Password reset completed successfully!");
      setFormData({ password: "", confirmPassword: "" });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.response?.data?.msg || "Something went wrong. The link may have expired.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-soft-bg/40 flex items-center justify-center px-6 py-12 text-dark-navy antialiased">
      {isSubmitting && (
        <div className="fixed inset-0 bg-[#0F172A]/30 backdrop-blur-xs z-50 flex flex-col items-center justify-center animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-sm w-[90%] mx-auto border border-light-border/40 text-center animate-scaleUp">
            <div className="relative flex items-center justify-center mb-5">
              <div className="absolute w-12 h-12 bg-primary/10 rounded-full animate-ping"></div>
              <Loader2 className="animate-spin text-primary relative z-10 w-8 h-8" />
            </div>
            <h3 className="text-dark-navy font-extrabold text-base tracking-tight">Updating your credentials</h3>
            <p className="text-muted-gray text-xs mt-1.5 font-semibold px-4">Applying new secure hashing and updating your account security keys...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white border border-light-border/60 shadow-2xs rounded-3xl p-8">
        {/* Back to Login */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest hover:text-primary transition-colors duration-200 mb-6 group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Login
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-dark-navy tracking-tight mb-1">
          Set New Password
        </h1>
        <p className="text-center text-xs text-muted-gray mb-6 font-semibold">
          Create a new strong password for your YoCart account
        </p>

        {errors.general && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-red-600">
              ❌ {errors.general}
            </p>
          </div>
        )}

        {successMsg ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Success!</h3>
              <p className="text-xs text-muted-gray font-semibold mt-1.5 leading-relaxed">
                {successMsg}
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block bg-primary hover:opacity-95 text-white py-2 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition duration-300"
              >
                Log In Now
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <label htmlFor="resetPassword" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
                New Password
              </label>

              <div className="relative">
                <SmoothInput
                  type={showPassword ? "text" : "password"}
                  id="resetPassword"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
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

            <div>
              <label htmlFor="resetConfirmPassword" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
                Confirm Password
              </label>

              <div className="relative">
                <SmoothInput
                  type={showConfirmPassword ? "text" : "password"}
                  id="resetConfirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
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
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition duration-300 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <KeyRound size={14} />
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
