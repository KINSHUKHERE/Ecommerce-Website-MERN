import React, { useEffect, useState, useMemo } from "react";
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Clock, 
  Loader2, 
  Check, 
  X,
  Store,
  Trash2,
  Plus,
  Mail,
  Lock,
  Phone,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getVendorsApi, updateVendorStatusApi, createVendorApi, deleteVendorApi } from "../../api/AuthApi";

const VendorManagement = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "", "pending", "active", "suspended"
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // Add Vendor Form state
  const [newVendor, setNewVendor] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    businessName: "",
    businessAddress: "",
    gstin: ""
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadVendors = async () => {
    try {
      const res = await getVendorsApi();
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch vendors", "error");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    loadVendors();
  }, []);

  const handleUpdateStatus = async (vendorId, newStatus) => {
    setActionId(vendorId);
    try {
      const res = await updateVendorStatusApi(vendorId, newStatus);
      showToast(res.data.msg || "Vendor status updated", "success");
      setVendors(prev => prev.map(v => v._id === vendorId ? { ...v, vendorStatus: newStatus } : v));
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to update status", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createVendorApi(newVendor);
      showToast("Vendor created successfully!", "success");
      setVendors(prev => [res.data.data, ...prev]);
      setShowAddModal(false);
      setNewVendor({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        businessName: "",
        businessAddress: "",
        gstin: ""
      });
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to create vendor", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVendor = async () => {
    if (!selectedVendor) return;
    setSubmitting(true);
    try {
      await deleteVendorApi(selectedVendor._id);
      showToast("Vendor purged successfully from database.", "success");
      setVendors(prev => prev.filter(v => v._id !== selectedVendor._id));
      setShowDeleteModal(false);
      setSelectedVendor(null);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to delete vendor", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Vendor Statistics
  const stats = useMemo(() => {
    return {
      total: vendors.length,
      pending: vendors.filter(v => v.vendorStatus === "pending").length,
      active: vendors.filter(v => v.vendorStatus === "active").length,
      suspended: vendors.filter(v => v.vendorStatus === "suspended").length,
    };
  }, [vendors]);

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = 
        (vendor.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vendor.businessName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vendor.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vendor.gstin || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !statusFilter || vendor.vendorStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">Loading vendor data...</p>
      </div>
    );
  }

  return (
    <div className="relative text-dark-navy antialiased text-left pb-10">
      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed bottom-5 right-5 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              toastType === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {toastType === "success" ? <Check size={12} /> : <X size={12} />}
          </div>
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-light-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-navy tracking-tight">
            Vendor Management
          </h1>
          <p className="text-xs text-muted-gray font-semibold mt-1">
            Review requests, manually add sellers, and manage platforms directory.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md hover:opacity-95 transition cursor-pointer"
        >
          <Plus size={14} />
          Add Seller
        </button>
      </div>

      {/* Analytics Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div
          onClick={() => setStatusFilter("")}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            !statusFilter ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-widest">Total</span>
            <div className="p-1.5 rounded-xl bg-primary/5 text-primary">
              <Users size={15} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.total}</span>
        </div>

        <div
          onClick={() => setStatusFilter("pending")}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            statusFilter === "pending" ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-amber-600 uppercase tracking-widest">Pending</span>
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock size={15} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.pending}</span>
        </div>

        <div
          onClick={() => setStatusFilter("active")}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            statusFilter === "active" ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-emerald-600 uppercase tracking-widest">Active</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle size={15} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.active}</span>
        </div>

        <div
          onClick={() => setStatusFilter("suspended")}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            statusFilter === "suspended" ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-red-655 uppercase tracking-widest">Suspended</span>
            <div className="p-1.5 rounded-xl bg-red-500/10 text-red-655">
              <XCircle size={15} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.suspended}</span>
        </div>
      </div>

      {/* Search Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-gray w-4 h-4" />
          <input
            type="text"
            placeholder="Search stores, owners, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy bg-white transition-all h-[38px]"
          />
        </div>
      </div>

      {/* Vendors Data Table */}
      <div className="bg-white border border-light-border/60 rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-light-border/60 text-left">
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Store / Owner</th>
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Contact Info</th>
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Tax ID / GSTIN</th>
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Joined Date</th>
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-center">Status</th>
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <tr 
                    key={vendor._id} 
                    onClick={() => {
                      navigate(`/admin/vendors/${vendor._id}`);
                    }}
                    className="border-b border-light-border/40 hover:bg-slate-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          {vendor.avatar ? (
                            <img src={vendor.avatar} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Store size={18} />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-dark-navy leading-normal">
                            {vendor.businessName || "Unnamed Store"}
                          </div>
                          <div className="text-[10px] text-muted-gray font-semibold uppercase tracking-wider mt-0.5">
                            {vendor.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-xs font-semibold text-dark-navy leading-normal">
                        {vendor.email}
                      </div>
                      <div className="text-[10px] text-muted-gray font-semibold mt-0.5">
                        {vendor.phoneNumber || "No phone added"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-light-border/40">
                        {vendor.gstin || "N/A"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-muted-gray">
                      {new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-current ${
                          vendor.vendorStatus === "active"
                            ? "bg-emerald-50/60 text-emerald-600 border-emerald-100/20"
                            : vendor.vendorStatus === "pending"
                            ? "bg-amber-50/60 text-amber-600 border-amber-100/20"
                            : "bg-red-50/60 text-red-655 border-red-100/20"
                        }`}
                      >
                        {vendor.vendorStatus === "active" && <CheckCircle size={10} />}
                        {vendor.vendorStatus === "pending" && <Clock size={10} />}
                        {vendor.vendorStatus === "suspended" && <XCircle size={10} />}
                        {vendor.vendorStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {vendor.vendorStatus !== "active" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(vendor._id, "active");
                            }}
                            disabled={actionId === vendor._id}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center cursor-pointer disabled:opacity-50 transition"
                            title="Approve Seller"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {vendor.vendorStatus !== "suspended" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(vendor._id, "suspended");
                            }}
                            disabled={actionId === vendor._id}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-100 flex items-center justify-center cursor-pointer disabled:opacity-50 transition"
                            title="Suspend Seller"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVendor(vendor);
                            setShowDeleteModal(true);
                          }}
                          disabled={actionId === vendor._id}
                          className="p-2 text-red-655 hover:bg-red-50 rounded-lg border border-red-100 flex items-center justify-center cursor-pointer disabled:opacity-50 transition"
                          title="Purge Vendor from DB"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-muted-gray text-xs font-semibold">
                    No vendors found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Seller Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleUp text-left relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-muted-gray transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Store size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-dark-navy tracking-tight">Add New Seller</h3>
                <p className="text-xs text-muted-gray font-semibold">Manually register an active vendor.</p>
              </div>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={newVendor.name}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="E.g. John Doe"
                    className="w-full border border-light-border rounded-xl px-3 py-2 text-xs font-semibold text-dark-navy"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newVendor.phoneNumber}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="10-digit number"
                    className="w-full border border-light-border rounded-xl px-3 py-2 text-xs font-semibold text-dark-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newVendor.email}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seller@example.com"
                  className="w-full border border-light-border rounded-xl px-3 py-2 text-xs font-semibold text-dark-navy"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-1">Access Password</label>
                <input
                  type="password"
                  required
                  value={newVendor.password}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Set account password"
                  className="w-full border border-light-border rounded-xl px-3 py-2 text-xs font-semibold text-dark-navy"
                />
              </div>

              <div className="border-t border-light-border/40 pt-4 mt-2">
                <h4 className="text-[10px] font-extrabold text-primary uppercase tracking-widest mb-3">Business Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-1">Store / Business Name</label>
                    <input
                      type="text"
                      required
                      value={newVendor.businessName}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="E.g. ElectroWorld"
                      className="w-full border border-light-border rounded-xl px-3 py-2 text-xs font-semibold text-dark-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      required
                      value={newVendor.gstin}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, gstin: e.target.value }))}
                      placeholder="GSTIN TAX ID"
                      className="w-full border border-light-border rounded-xl px-3 py-2 text-xs font-semibold text-dark-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest mb-1">Business Address</label>
                  <textarea
                    required
                    rows="2.5"
                    value={newVendor.businessAddress}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, businessAddress: e.target.value }))}
                    placeholder="Enter physical address"
                    className="w-full border border-light-border rounded-xl px-3 py-2 text-xs font-semibold text-dark-navy resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-light-border/40">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-light-border rounded-xl text-xs font-extrabold uppercase tracking-wider text-muted-gray hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:opacity-95 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 size={12} className="animate-spin" />}
                  Register Seller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-scaleUp text-center relative">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-655 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} />
            </div>

            <h3 className="text-base font-extrabold text-dark-navy tracking-tight mb-2">Delete Vendor Account?</h3>
            <p className="text-xs text-muted-gray font-semibold mb-6 px-2 leading-relaxed">
              Are you sure you want to delete <span className="text-dark-navy font-bold">{selectedVendor.businessName}</span> from the database? This will permanently delete their account and all associated product listings. This action is irreversible.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                disabled={submitting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedVendor(null);
                }}
                className="px-4 py-2 border border-light-border rounded-xl text-xs font-extrabold uppercase tracking-wider text-muted-gray hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleDeleteVendor}
                className="px-4 py-2 bg-red-655 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-red-600 transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {submitting && <Loader2 size={12} className="animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorManagement;
