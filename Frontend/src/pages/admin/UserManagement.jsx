import { useEffect, useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  Trash2, 
  ShieldAlert, 
  UserMinus, 
  UserCheck, 
  Loader2, 
  Check, 
  X,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { allUsers, deleteUserApi, toggleUserSuspensionApi } from "../../api/AuthApi";

const UserManagement = () => {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "", "active", "suspended"
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  
  // Action Modals State
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadUsers = async () => {
    try {
      const res = await allUsers();
      // Filter list to include ONLY role === "user" (ordinary customers)
      const customersOnly = (res.data || []).filter(u => u.role === "user");
      // Sorted by createdAt desc
      const sorted = customersOnly.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUsersList(sorted);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleSuspend = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await toggleUserSuspensionApi(selectedUser._id);
      showToast(res.data.msg || "User status updated", "success");
      setUsersList(prev => prev.map(u => u._id === selectedUser._id ? { ...u, isSuspended: !u.isSuspended } : u));
      setShowSuspendModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to update suspension status", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await deleteUserApi(selectedUser._id);
      showToast("User account deleted successfully from DB.", "success");
      setUsersList(prev => prev.filter(u => u._id !== selectedUser._id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.msg || "Failed to delete user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // User Stats
  const stats = useMemo(() => {
    return {
      total: usersList.length,
      active: usersList.filter(u => !u.isSuspended).length,
      suspended: usersList.filter(u => u.isSuspended).length,
    };
  }, [usersList]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      const matchesSearch = 
        (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phoneNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !statusFilter || 
        (statusFilter === "suspended" ? user.isSuspended : !user.isSuspended);

      return matchesSearch && matchesStatus;
    });
  }, [usersList, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">Loading platform users...</p>
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
      <div className="mb-6 border-b border-light-border/40 pb-4">
        <h1 className="text-2xl font-extrabold text-dark-navy tracking-tight">
          User Management
        </h1>
        <p className="text-xs text-muted-gray font-semibold mt-1">
          Monitor all registered customer accounts, suspend access, or delete profiles from database.
        </p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div
          onClick={() => { setStatusFilter(""); }}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            !statusFilter ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-widest">Total Users</span>
            <div className="p-1.5 rounded-xl bg-primary/5 text-primary">
              <Users size={15} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.total}</span>
        </div>

        <div
          onClick={() => { setStatusFilter("active"); }}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            statusFilter === "active" ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-emerald-600 uppercase tracking-widest">Active Accounts</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle size={15} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.active}</span>
        </div>

        <div
          onClick={() => { setStatusFilter("suspended"); }}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            statusFilter === "suspended" ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-extrabold text-red-655 uppercase tracking-widest">Suspended Accounts</span>
            <div className="p-1.5 rounded-xl bg-red-500/10 text-red-655">
              <ShieldAlert size={15} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.suspended}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-gray w-4 h-4" />
          <input
            type="text"
            placeholder="Search users by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy bg-white transition-all h-[38px]"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto relative z-30">
          <button
            type="button"
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className="border border-light-border rounded-xl px-3 py-2 text-xs font-bold text-dark-navy bg-white hover:bg-slate-50 transition-all outline-none h-[38px] cursor-pointer flex-1 sm:flex-none flex items-center justify-between gap-6 shadow-2xs min-w-[140px]"
          >
            <span>
              {statusFilter === "" && "All Statuses"}
              {statusFilter === "active" && "Active"}
              {statusFilter === "suspended" && "Suspended"}
            </span>
            <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${statusDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {statusDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setStatusDropdownOpen(false)}></div>
              <div className="absolute right-0 top-full mt-1.5 w-full bg-white border border-light-border/60 rounded-2xl shadow-md p-1.5 z-20 animate-scaleUp text-left min-w-[140px]">
                {[
                  { key: "", label: "All Statuses", icon: Users, color: "text-primary bg-indigo-50/50" },
                  { key: "active", label: "Active", icon: CheckCircle, color: "text-emerald-500 bg-emerald-50/50" },
                  { key: "suspended", label: "Suspended", icon: XCircle, color: "text-rose-500 bg-rose-50/50" }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = statusFilter === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setStatusFilter(item.key);
                        setStatusDropdownOpen(false);
                      }}
                      className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all text-left ${
                        isSelected ? "bg-primary/5 text-primary font-black" : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                      }`}
                    >
                      <div className={`w-5.5 h-5.5 rounded-md flex items-center justify-center ${item.color} transition-all duration-200 group-hover:scale-105`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-[11px] font-bold transition-colors">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="bg-white border border-light-border/60 rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-light-border/60 text-left">
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Name / Account</th>
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Email Address</th>
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Phone Number</th>
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Registered Date</th>
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-center">Status</th>
                <th className="px-5 py-4 text-[10px] font-extrabold text-muted-gray uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((item) => (
                  <tr 
                    key={item._id} 
                    onClick={() => {
                      navigate(`/admin/users/${item._id}`);
                    }}
                    className="border-b border-light-border/40 hover:bg-slate-50/40 transition-colors cursor-pointer"
                  >
                    {/* Name / Avatar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-light-border flex items-center justify-center text-slate-500 flex-shrink-0 relative">
                          {item.avatar ? (
                            <img src={item.avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <span className="font-extrabold text-xs uppercase">{item.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-dark-navy leading-normal">
                            {item.name}
                          </div>
                          <span className="inline-block text-[9px] font-extrabold uppercase mt-0.5 px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-light-border/40">
                            Customer
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-xs font-semibold text-dark-navy">
                      {item.email}
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 text-xs font-semibold text-slate-600 font-mono">
                      {item.phoneNumber || "N/A"}
                    </td>

                    {/* Registration Date */}
                    <td className="px-5 py-4 text-xs text-slate-600 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-muted-gray" />
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                          item.isSuspended 
                            ? "bg-red-50 text-red-655 border-red-100" 
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isSuspended ? "bg-red-500" : "bg-emerald-500"}`} />
                          {item.isSuspended ? "Suspended" : "Active"}
                        </span>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(item);
                            setShowSuspendModal(true);
                          }}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            item.isSuspended 
                              ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-600" 
                              : "bg-amber-50 hover:bg-amber-100 border-amber-100 text-amber-600"
                          }`}
                          title={item.isSuspended ? "Reactivate User" : "Suspend User"}
                        >
                          {item.isSuspended ? <UserCheck size={14} /> : <UserMinus size={14} />}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(item);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-655 transition cursor-pointer"
                          title="Delete User From Database"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-xs font-semibold text-muted-gray">
                    No customer accounts found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-scaleUp text-center relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border ${
              selectedUser.isSuspended 
                ? "bg-emerald-50 text-emerald-500 border-emerald-100" 
                : "bg-amber-50 text-amber-500 border-amber-100"
            }`}>
              {selectedUser.isSuspended ? <UserCheck size={20} /> : <UserMinus size={20} />}
            </div>

            <h3 className="text-base font-extrabold text-dark-navy tracking-tight mb-2">
              {selectedUser.isSuspended ? "Reactivate Account?" : "Suspend Account?"}
            </h3>
            <p className="text-xs text-muted-gray font-semibold mb-6 px-2 leading-relaxed">
              {selectedUser.isSuspended
                ? `Unlock this user's profile. They will recover complete access to log in and order services immediately.`
                : `Suspend login privileges for ${selectedUser.name}. They will be blocked instantly from shopping, cart sessions, or dashboard operations.`}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                disabled={submitting}
                onClick={() => {
                  setShowSuspendModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-light-border rounded-xl text-xs font-extrabold uppercase tracking-wider text-muted-gray hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleToggleSuspend}
                className={`px-4 py-2 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  selectedUser.isSuspended 
                    ? "bg-emerald-500 hover:bg-emerald-600" 
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                {submitting && <Loader2 size={12} className="animate-spin" />}
                Confirm Status Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-light-border/60 rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-scaleUp text-center relative">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} />
            </div>

            <h3 className="text-base font-extrabold text-dark-navy tracking-tight mb-2">
              Delete User Account?
            </h3>
            <p className="text-xs text-muted-gray font-semibold mb-6 px-2 leading-relaxed">
              Are you sure you want to permanently delete the profile of <strong className="text-dark-navy">{selectedUser.name}</strong> from database? This action is irreversible.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                disabled={submitting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-light-border rounded-xl text-xs font-extrabold uppercase tracking-wider text-muted-gray hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1.5"
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

export default UserManagement;
