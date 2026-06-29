import React, { useEffect, useState, useMemo } from "react";
import { getContact } from "../../api/ContactApi";
import {
  MessageSquare,
  Mail,
  User,
  Clock,
  Search,
  RotateCcw,
  Loader2,
  Inbox,
  Check,
  X
} from "lucide-react";

const ContactDetails = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // 'all', 'today', 'week'
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest', 'oldest'

  const fetchContact = async () => {
    try {
      const data = await getContact();
      setContacts(data.data.contacts || []);
    } catch (err) {
      console.log("Unable to fetch the contacts Details", err);
      showToast("Failed to fetch contact queries", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleResetFilters = () => {
    setSearch("");
    setDateFilter("all");
    setSortOrder("newest");
    showToast("Filters reset successfully", "success");
  };

  // Analytics Stats Section
  const stats = useMemo(() => {
    const total = contacts.length;
    // Unique senders
    const uniqueEmails = new Set(contacts.map((c) => c.Email?.toLowerCase()).filter(Boolean)).size;
    return { total, uniqueEmails };
  }, [contacts]);

  // Filtered and Sorted contacts list
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // 1. Search Query (Name, Email, Message)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.Name?.toLowerCase().includes(q) ||
          c.Email?.toLowerCase().includes(q) ||
          c.Message?.toLowerCase().includes(q)
      );
    }

    // 2. Date Range Filter
    if (dateFilter === "today") {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      result = result.filter((c) => new Date(c.createdAt) >= oneDayAgo);
    } else if (dateFilter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      result = result.filter((c) => new Date(c.createdAt) >= oneWeekAgo);
    }

    // 3. Sorting
    if (sortOrder === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return result;
  }, [contacts, search, dateFilter, sortOrder]);

  return (
    <div className="relative text-dark-navy antialiased text-left">
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
          Contact Queries
        </h1>
        <p className="text-xs text-muted-gray font-semibold mt-1">
          Review and search client inquiries submitted via the store contact form.
        </p>
      </div>

      {/* Analytics Stats Section */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div
          onClick={() => setDateFilter("all")}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            dateFilter === "all" ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-widest">Total Queries</span>
            <div className="p-1.5 rounded-xl bg-primary/5 text-primary">
              <MessageSquare size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.total}</span>
        </div>

        <div className="flex flex-col p-4 bg-white border border-light-border/60 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-widest">Unique Senders</span>
            <div className="p-1.5 rounded-xl bg-primary/5 text-primary">
              <User size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.uniqueEmails}</span>
        </div>
      </div>

      {/* Search & Filters Block */}
      <div className="bg-white border border-light-border/60 rounded-2xl p-4 mb-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by sender name, email, message keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-light-border bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy h-[36px]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray hover:text-dark-navy cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-light-border bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy appearance-none cursor-pointer h-[36px]"
            >
              <option value="all">All Dates</option>
              <option value="today">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>

          {/* Sort Order */}
          <div className="relative min-w-[140px]">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-light-border bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy appearance-none cursor-pointer h-[36px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>

          {/* Reset Filters */}
          {(search || dateFilter !== "all" || sortOrder !== "newest") && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer h-[36px]"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content Table/Grid */}
      <div className="bg-white border border-light-border/60 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-light-border/40 flex justify-between items-center bg-slate-50/20">
          <h2 className="text-xs font-extrabold text-dark-navy uppercase tracking-widest">Messages Registry</h2>
          <span className="text-xs font-bold text-muted-gray">
            Showing {filteredContacts.length} of {contacts.length}
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8 mb-4" />
            <p className="text-xs font-bold text-muted-gray animate-pulse">Loading message registry...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-16 text-center">
            <Inbox className="w-12 h-12 text-muted-gray/50 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-dark-navy uppercase tracking-widest">No Messages Found</h3>
            <p className="text-xs font-semibold text-muted-gray mt-1">Try resetting filters or adjusting search queries.</p>
            {(search || dateFilter !== "all") && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 border border-light-border hover:bg-slate-50 text-dark-navy text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/65 text-muted-gray border-b border-light-border/40 text-[10px] font-extrabold uppercase tracking-widest">
                  <th className="py-3.5 px-6 text-left w-1/4">Sender Details</th>
                  <th className="py-3.5 px-6 w-[55%]">Message Body</th>
                  <th className="py-3.5 px-6 text-center w-[20%]">Submitted At</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-light-border/40 text-sm font-semibold text-dark-navy">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-slate-50/30 transition-all duration-200"
                  >
                    {/* Sender column */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-dark-navy text-sm flex items-center gap-1.5">
                          <User size={13} className="text-muted-gray" />
                          {contact.Name || "Anonymous"}
                        </span>
                        <span className="text-xs font-semibold text-muted-gray flex items-center gap-1.5 mt-0.5">
                          <Mail size={12} className="text-muted-gray" />
                          {contact.Email || "No Email"}
                        </span>
                      </div>
                    </td>

                    {/* Message column */}
                    <td className="py-4 px-6">
                      <p className="text-dark-navy leading-relaxed max-w-2xl text-xs font-semibold whitespace-pre-wrap">
                        {contact.Message}
                      </p>
                    </td>

                    {/* Time column */}
                    <td className="py-4 px-6 text-center text-xs font-semibold text-muted-gray whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 bg-slate-100 border border-light-border/45 px-2.5 py-1 rounded-xl text-dark-navy font-bold">
                        <Clock size={11} className="text-muted-gray" />
                        {new Date(contact.createdAt).toLocaleTimeString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactDetails;
