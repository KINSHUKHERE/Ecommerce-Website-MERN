import { useState } from "react";
import { postContact } from "../../api/ContactApi";
import { MessageSquare, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const VendorSupport = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  
  const [formData, setFormData] = useState({
    Name: user.name || "",
    Email: user.email || "",
    Message: "",
    type: "vendor"
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Message.trim()) {
      setError("Please write a message before submitting.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await postContact(formData);
      setSuccess(true);
      setFormData(prev => ({ ...prev, Message: "" }));
    } catch (err) {
      console.error(err);
      setError("Unable to submit support query. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-dark-navy antialiased text-left pb-10 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="border-b border-light-border/40 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Platform Support
        </h1>
        <p className="text-xs text-muted-gray font-semibold mt-1">
          Submit any queries, technical issues, or store concerns to the platform administration.
        </p>
      </div>

      {/* Support Query Form Card */}
      <div className="bg-white border border-light-border/60 rounded-3xl p-6 md:p-8 shadow-2xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center">
            <MessageSquare size={18} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-dark-navy">Create Query Ticket</h2>
            <span className="text-[10px] text-muted-gray font-semibold uppercase tracking-wider block">Direct support desk</span>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
            <span>Support query submitted successfully! The administrators will review it shortly.</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label htmlFor="vendorSupportName" className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Owner / Merchant Name</label>
            <input 
              type="text" 
              id="vendorSupportName"
              name="vendorSupportName"
              readOnly 
              value={formData.Name}
              className="w-full border border-light-border/60 bg-slate-50 text-muted-gray rounded-xl px-4 py-2.5 outline-none font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="vendorSupportEmail" className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Registered Store Email</label>
            <input 
              type="email" 
              id="vendorSupportEmail"
              name="vendorSupportEmail"
              readOnly 
              value={formData.Email}
              className="w-full border border-light-border/60 bg-slate-50 text-muted-gray rounded-xl px-4 py-2.5 outline-none font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="vendorSupportMessage" className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-1.5">Query Message</label>
            <textarea 
              required
              rows="5"
              id="vendorSupportMessage"
              name="vendorSupportMessage"
              value={formData.Message}
              onChange={(e) => setFormData(prev => ({ ...prev, Message: e.target.value }))}
              placeholder="Describe your query, technical support request, or concern in detail..."
              className="w-full border border-light-border rounded-xl px-4 py-3 outline-none text-dark-navy focus:ring-4 focus:ring-primary/5 focus:border-primary transition resize-none font-medium leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:opacity-95 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              Submit Support Query
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorSupport;
