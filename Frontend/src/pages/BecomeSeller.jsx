import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Store, MapPin, FileText, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { becomeSellerApi } from "../api/AuthApi";

// Simple alert toast helper
const showToast = (msg, type = "success") => {
  const event = new CustomEvent("toast", { detail: { message: msg, type } });
  window.dispatchEvent(event);
};

const BecomeSeller = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    gstin: "",
  });
  const [errors, setErrors] = useState({
    businessName: "",
    businessAddress: "",
    gstin: "",
    general: "",
  });

  const handleChange = (e) => {
    setErrors({
      ...errors,
      [e.target.name]: "",
      general: "",
    });
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({
      businessName: "",
      businessAddress: "",
      gstin: "",
      general: "",
    });

    let hasErrors = false;
    const newErrors = {
      businessName: "",
      businessAddress: "",
      gstin: "",
      general: "",
    };

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

    if (hasErrors) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await becomeSellerApi(formData);
      showToast(response.data.msg || "Congratulations! You are now a seller.", "success");
      
      // Update local storage user profile
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Redirect to seller dashboard portal
      setTimeout(() => {
        navigate("/vendor");
        window.location.reload();
      }, 1000);
    } catch (err) {
      const errMsg = err.response?.data?.msg || "Failed to submit seller registration request";
      const updatedErrors = {
        businessName: "",
        businessAddress: "",
        gstin: "",
        general: "",
      };

      if (errMsg.toLowerCase().includes("gstin")) {
        updatedErrors.gstin = errMsg;
      } else if (errMsg.toLowerCase().includes("name")) {
        updatedErrors.businessName = errMsg;
      } else {
        updatedErrors.general = errMsg;
      }
      setErrors(updatedErrors);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-dark-navy antialiased">
      <div className="max-w-md w-full bg-white border border-light-border/60 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden text-left">
        {/* Top Decorative Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent"></div>

        {/* Heading Icon block */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-dark-navy tracking-tight">
              Seller Registration
            </h1>
            <p className="text-xs text-muted-gray font-semibold uppercase tracking-wider mt-0.5">
              Launch your shop on YoCart
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-gray mb-6 leading-relaxed font-medium">
          Fill out the details below to register your business and instantly gain access to the Seller Portal to manage products, view sales stats, and process customer orders.
        </p>

        {errors.general && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-red-600">
              ❌ {errors.general}
            </p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Business Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="businessName" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest">
              Business / Store Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                <Store size={15} />
              </span>
              <input
                type="text"
                id="businessName"
                name="businessName"
                required
                value={formData.businessName}
                onChange={handleChange}
                placeholder="E.g., SuperTech Electronics"
                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all ${
                  errors.businessName ? "border-red-500" : "border-light-border"
                }`}
              />
            </div>
            {errors.businessName && (
              <p className="text-red-500 text-[11px] font-bold mt-1 ml-1">
                ⚠️ {errors.businessName}
              </p>
            )}
          </div>

          {/* GSTIN / Tax ID */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="gstin" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest">
              GSTIN / TAX Identification Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                <FileText size={15} />
              </span>
              <input
                type="text"
                id="gstin"
                name="gstin"
                required
                value={formData.gstin}
                onChange={handleChange}
                placeholder="E.g., 07AAAAA1111A1Z1"
                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all ${
                  errors.gstin ? "border-red-500" : "border-light-border"
                }`}
              />
            </div>
            {errors.gstin && (
              <p className="text-red-500 text-[11px] font-bold mt-1 ml-1">
                ⚠️ {errors.gstin}
              </p>
            )}
          </div>

          {/* Business Address */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="businessAddress" className="text-xs font-extrabold text-muted-gray uppercase tracking-widest">
              Store / Warehouse Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pt-3 text-muted-gray pointer-events-none">
                <MapPin size={15} />
              </span>
              <textarea
                id="businessAddress"
                name="businessAddress"
                required
                rows="3"
                value={formData.businessAddress}
                onChange={handleChange}
                placeholder="E.g., 405 Tech Park, Block 3, New Delhi, 110001"
                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all resize-none ${
                  errors.businessAddress ? "border-red-500" : "border-light-border"
                }`}
              />
            </div>
            {errors.businessAddress && (
              <p className="text-red-500 text-[11px] font-bold mt-1 ml-1">
                ⚠️ {errors.businessAddress}
              </p>
            )}
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start gap-2.5 mt-4 bg-slate-50 p-3 rounded-xl border border-light-border/40">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              required
              className="mt-1 w-4 h-4 text-primary border-light-border rounded focus:ring-primary focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="agreeTerms" className="text-[11px] font-semibold text-muted-gray leading-tight">
              I agree to the <Link to="/terms-conditions" target="_blank" className="text-primary hover:underline font-bold">Terms & Conditions</Link>, including the dynamic monthly sales admin commission (1% for sales &lt; 2L, 5% for &lt; 10L, 10% for &gt; 10L).
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Become a Seller
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BecomeSeller;
