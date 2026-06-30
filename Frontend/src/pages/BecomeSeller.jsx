import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await becomeSellerApi(formData);
      showToast(response.data.msg || "Congratulations! You are now a seller.", "success");
      
      // Update local storage user profile
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Redirect to seller dashboard portal
      setTimeout(() => {
        navigate("/admin");
        window.location.reload();
      }, 1000);
    } catch (err) {
      showToast(err.response?.data?.msg || "Failed to submit seller registration request", "error");
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
                className="w-full pl-9 pr-4 py-2.5 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all"
              />
            </div>
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
                className="w-full pl-9 pr-4 py-2.5 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all"
              />
            </div>
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
                className="w-full pl-9 pr-4 py-2.5 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-semibold text-dark-navy bg-white transition-all resize-none"
              />
            </div>
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
