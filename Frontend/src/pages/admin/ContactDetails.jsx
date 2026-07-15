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
  X,
  Users,
  ChevronDown,
  Calendar,
  ArrowUpDown
} from "lucide-react";

const ContactDetails = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Search, Filter & Tab State
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // 'all', 'today', 'week'
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest', 'oldest'
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [queryTypeFilter, setQueryTypeFilter] = useState("user"); // 'user', 'vendor'

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

  // Unique tab counts
  const tabCounts = useMemo(() => {
    const userCount = contacts.filter((c) => c.type !== "vendor").length;
    const vendorCount = contacts.filter((c) => c.type === "vendor").length;
    return { userCount, vendorCount };
  }, [contacts]);

  // Analytics Stats Section
  const stats = useMemo(() => {
    const total = contacts.length;
    const uniqueEmails = new Set(contacts.map((c) => c.Email?.toLowerCase()).filter(Boolean)).size;
    return { total, uniqueEmails };
  }, [contacts]);

  // Filtered and Sorted contacts list
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // 1. Filter by Query Type Tab (user vs vendor)
    result = result.filter((c) => {
      const isVendorQuery = c.type === "vendor";
      return queryTypeFilter === "vendor" ? isVendorQuery : !isVendorQuery;
    });

    // 2. Search Query (Name, Email, Message)
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.Name?.toLowerCase().includes(q) ||
          c.Email?.toLowerCase().includes(q) ||
          c.Message?.toLowerCase().includes(q)
      );
    }

    // 3. Date Range Filter
    if (dateFilter === "today") {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      result = result.filter((c) => new Date(c.createdAt) >= oneDayAgo);
    } else if (dateFilter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      result = result.filter((c) => new Date(c.createdAt) >= oneWeekAgo);
    }

    // 4. Sorting
    if (sortOrder === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return result;
  }, [contacts, search, dateFilter, sortOrder, queryTypeFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">Loading queries list...</p>
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
          Contact Queries
        </h1>
        <p className="text-xs text-muted-gray font-semibold mt-1">
          Review client and seller inquiries submitted via the store contact form.
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

      {/* Type Tabs Selection (Users' / Vendors') */}
      <div className="flex border-b border-light-border/50 mb-6 gap-2">
        <button
          onClick={() => setQueryTypeFilter("user")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 tracking-wide transition cursor-pointer ${
            queryTypeFilter === "user"
              ? "border-primary text-primary"
              : "border-transparent text-muted-gray hover:text-dark-navy"
          }`}
        >
          <User size={14} />
          Customer Queries
          <span className="ml-1.5 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-slate-100 text-slate-600">
            {tabCounts.userCount}
          </span>
        </button>
        <button
          onClick={() => setQueryTypeFilter("vendor")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 tracking-wide transition cursor-pointer ${
            queryTypeFilter === "vendor"
              ? "border-primary text-primary"
              : "border-transparent text-muted-gray hover:text-dark-navy"
          }`}
        >
          <Users size={14} />
          Vendor Queries
          <span className="ml-1.5 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-slate-100 text-slate-600">
            {tabCounts.vendorCount}
          </span>
        </button>
      </div>

      {/* Search & Filters Block */}
      <div className="bg-white border border-light-border/60 rounded-2xl p-4 mb-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-gray w-4 h-4" />
            <input
              type="text"
              placeholder="Search sender name, email, query text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy bg-white transition-all h-[38px]"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative min-w-[130px] z-30">
              <button
                type="button"
                onClick={() => {
                  setDateDropdownOpen(!dateDropdownOpen);
                  setSortDropdownOpen(false);
                }}
                className="w-full border border-light-border rounded-xl px-3 py-2 text-xs font-bold text-dark-navy bg-white hover:bg-slate-50 transition-all outline-none h-[38px] cursor-pointer flex items-center justify-between gap-4 shadow-2xs"
              >
                <span>
                  {dateFilter === "all" && "All Dates"}
                  {dateFilter === "today" && "Received Today"}
                  {dateFilter === "week" && "Past 7 Days"}
                </span>
                <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${dateDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dateDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setDateDropdownOpen(false)}></div>
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-light-border/60 rounded-2xl shadow-md p-1.5 z-20 animate-scaleUp text-left min-w-[140px]">
                    {[
                      { key: "all", label: "All Dates", icon: Calendar, color: "text-primary bg-indigo-50/50" },
                      { key: "today", label: "Received Today", icon: Clock, color: "text-amber-500 bg-amber-50/50" },
                      { key: "week", label: "Past 7 Days", icon: Clock, color: "text-indigo-500 bg-indigo-50/50" }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = dateFilter === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setDateFilter(item.key);
                            setDateDropdownOpen(false);
                          }}
                          className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 transition-all text-left ${
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

            <div className="relative min-w-[130px] z-30">
              <button
                type="button"
                onClick={() => {
                  setSortDropdownOpen(!sortDropdownOpen);
                  setDateDropdownOpen(false);
                }}
                className="w-full border border-light-border rounded-xl px-3 py-2 text-xs font-bold text-dark-navy bg-white hover:bg-slate-50 transition-all outline-none h-[38px] cursor-pointer flex items-center justify-between gap-4 shadow-2xs"
              >
                <span>
                  {sortOrder === "newest" && "Newest First"}
                  {sortOrder === "oldest" && "Oldest First"}
                </span>
                <ChevronDown size={14} className={`text-muted-gray transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {sortDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setSortDropdownOpen(false)}></div>
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-light-border/60 rounded-2xl shadow-md p-1.5 z-20 animate-scaleUp text-left min-w-[140px]">
                    {[
                      { key: "newest", label: "Newest First", icon: ArrowUpDown, color: "text-primary bg-indigo-50/50" },
                      { key: "oldest", label: "Oldest First", icon: ArrowUpDown, color: "text-indigo-500 bg-indigo-50/50" }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = sortOrder === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setSortOrder(item.key);
                            setSortDropdownOpen(false);
                          }}
                          className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 transition-all text-left ${
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

            <button
              onClick={handleResetFilters}
              className="px-3 border border-light-border hover:bg-slate-50 text-muted-gray hover:text-dark-navy rounded-xl flex items-center justify-center cursor-pointer transition h-[38px]"
              title="Reset Filters"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid queries card representation */}
      {filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact._id}
              className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition duration-300 relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                      {contact.Name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-dark-navy leading-none">{contact.Name}</h4>
                      <span className="text-[10px] text-muted-gray font-semibold mt-1 block">
                        {contact.Email}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-gray font-semibold">
                    <Clock size={10} />
                    {new Date(contact.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric"
                    })}
                  </div>
                </div>

                <div className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/50 rounded-xl p-3 border border-light-border/30 mb-4 whitespace-pre-line">
                  {contact.Message}
                </div>
              </div>

              <div className="border-t border-light-border/40 pt-3 flex justify-between items-center text-[10px] text-muted-gray font-semibold uppercase tracking-wider">
                <span>Query ID: #{contact._id.slice(-6)}</span>
                <a
                  href={`mailto:${contact.Email}?subject=Reply to YoCart Inquiry`}
                  className="px-2.5 py-1 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 rounded-lg transition"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-light-border/60 rounded-3xl p-12 text-center shadow-2xs">
          <Inbox className="mx-auto w-10 h-10 text-muted-gray mb-3 stroke-[1.5]" />
          <p className="text-xs font-semibold text-muted-gray">
            No query messages found matching criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactDetails;
