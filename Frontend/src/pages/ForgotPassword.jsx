import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/AuthApi";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { SmoothInput } from "../components/SmoothInput";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await forgotPassword(email);
      setSuccessMsg(response.data?.msg || "Reset password instructions have been dispatched.");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong. Please try again later.");
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
            <h3 className="text-dark-navy font-extrabold text-base tracking-tight">Requesting reset link</h3>
            <p className="text-muted-gray text-xs mt-1.5 font-semibold px-4">Contacting authentication server and dispatching recovery code...</p>
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
          Recover Password
        </h1>
        <p className="text-center text-xs text-muted-gray mb-6 font-semibold">
          Enter your email to request recovery instructions
        </p>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-red-600">
              ❌ {error}
            </p>
          </div>
        )}

        {successMsg ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Instructions Dispatched</h3>
              <p className="text-xs text-muted-gray font-semibold mt-1.5 leading-relaxed">
                {successMsg}
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block bg-primary hover:opacity-95 text-white py-2 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition duration-300"
              >
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <label htmlFor="forgotEmail" className="block text-xs font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">
                Email Address
              </label>

              <div className="relative">
                <SmoothInput
                  type="email"
                  id="forgotEmail"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  autoComplete="email"
                  className="w-full border border-light-border rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary text-sm font-semibold bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition duration-300 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <Mail size={14} />
              Send Recovery Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
