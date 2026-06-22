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
    <div className="relative leading-normal">
      {/* Toast Alert Widget */}
      {message && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-150 shadow-md animate-slideIn">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toastType === "success"
                ? "bg-green-50 text-green-600 border border-green-100"
                : "bg-red-50 text-red-655 border border-red-100"
            }`}
          >
            {toastType === "success" ? <Check size={14} /> : <X size={14} />}
          </div>
          <span className="text-sm font-medium text-gray-800">{message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 leading-normal">
          Contact Queries
        </h1>
        <p className="text-[13px] font-normal text-gray-500 mt-1 leading-relaxed">
          Review and search client inquiries submitted via the store contact form.
        </p>
      </div>

      {/* Analytics Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div
          onClick={() => setDateFilter("all")}
          className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
            dateFilter === "all" ? "border-[#088178] ring-2 ring-[#088178]/5" : "border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-gray-500">Total Queries</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <MessageSquare size={16} />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.total}</span>
        </div>

        <div className="flex flex-col p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-gray-500">Unique Senders</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <User size={16} />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.uniqueEmails}</span>
        </div>
      </div>

      {/* Search & Filters Block */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 mb-6 shadow-sm shadow-slate-100/30">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by sender name, email, message keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 bg-slate-50/70 border border-slate-100 rounded-lg focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all duration-300"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-450 hover:text-gray-600 cursor-pointer"
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
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-100 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 appearance-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>

          {/* Sort Order */}
          <div className="relative min-w-[140px]">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-100 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>

          {/* Reset Filters */}
          {(search || dateFilter !== "all" || sortOrder !== "newest") && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 border border-red-100 text-red-500 hover:bg-red-50/40 py-2 px-3.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer h-[34px]"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content Table/Grid */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm shadow-slate-100/30">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
          <h2 className="text-base font-semibold text-slate-800">Messages Registry</h2>
          <span className="text-[13px] font-normal text-gray-500">
            Showing {filteredContacts.length} of {contacts.length}
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#088178] w-8 h-8 mb-4" />
            <p className="text-xs font-normal text-gray-500 animate-pulse">Loading message registry...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-16 text-center shadow-sm">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Messages Found</h3>
            <p className="text-[13px] font-normal text-gray-500 mt-1">Try resetting filters or adjusting search queries.</p>
            {(search || dateFilter !== "all") && (
              <button
                onClick={handleResetFilters}
                className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
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
                <tr className="bg-slate-50/65 text-gray-500 border-b border-slate-100 text-[13px] font-normal">
                  <th className="py-3 px-4 w-1/4">Sender Details</th>
                  <th className="py-3 px-4 w-[55%]">Message Body</th>
                  <th className="py-3 px-4 text-center w-[20%]">Submitted At</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-[14px] font-normal text-slate-800">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-slate-50/30 transition-all duration-200"
                  >
                    {/* Sender column */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-800 text-[14px] flex items-center gap-1.5">
                          <User size={13} className="text-slate-400" />
                          {contact.Name || "Anonymous"}
                        </span>
                        <span className="text-[13px] font-normal text-gray-500 flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-400" />
                          {contact.Email || "No Email"}
                        </span>
                      </div>
                    </td>

                    {/* Message column */}
                    <td className="py-4 px-4">
                      <p className="text-slate-700 leading-relaxed max-w-2xl text-[14px] whitespace-pre-wrap">
                        {contact.Message}
                      </p>
                    </td>

                    {/* Time column */}
                    <td className="py-4 px-4 text-center text-[13px] font-normal text-gray-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                        <Clock size={11} className="text-slate-400" />
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
