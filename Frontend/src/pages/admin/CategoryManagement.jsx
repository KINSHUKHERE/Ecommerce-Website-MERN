import { useEffect, useState, useMemo } from "react";
import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../../api/CategoryAndBrandApi";
import {
  Tag,
  PlusCircle,
  Loader2,
  Inbox,
  Search,
  CheckCircle,
  XCircle,
  RotateCcw,
  Edit3,
  Trash2,
  Check,
  X,
  Plus,
  ChevronDown
} from "lucide-react";

const CategoryManagement = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryCommission, setCategoryCommission] = useState("5");
  const [categories, setCategories] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryCommission, setEditCategoryCommission] = useState("5");

  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.log("Unable to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (msg, type = "success") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      showToast("Please enter a category name", "error");
      return;
    }

    try {
      setSubmitting(true);
      await addCategory({
        name: categoryName,
        commissionPercentage: Number(categoryCommission || 5),
      });

      showToast("Category added successfully", "success");
      setCategoryName("");
      setCategoryCommission("5");
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.msg || "Failed to add category", "error");
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setEditCategoryName(category.name);
    setEditCategoryCommission(category.commissionPercentage || "5");
  };

  const handleUpdateInline = async (id) => {
    if (!editCategoryName.trim()) {
      showToast("Category name cannot be empty", "error");
      return;
    }

    try {
      setSubmitting(true);
      await updateCategory(id, {
        name: editCategoryName,
        commissionPercentage: Number(editCategoryCommission || 5),
      });

      showToast("Category updated successfully", "success");
      setEditingId(null);
      setEditCategoryName("");
      setEditCategoryCommission("5");
      fetchCategories();
    } catch (err) {
      showToast("Failed to update category", "error");
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setActionLoadingId(id);
      await toggleCategoryStatus(id);
      showToast("Category status updated successfully", "success");
      fetchCategories();
    } catch (err) {
      showToast("Failed to update category status", "error");
      console.log(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmDelete) return;

    try {
      setActionLoadingId(id);
      await deleteCategory(id);
      showToast("Category deleted successfully", "success");
      fetchCategories();
    } catch (err) {
      showToast("Failed to delete category", "error");
      console.log(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  // Memoized stats calculation for analyzing
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive ?? true).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [categories]);

  // Memoized filtered categories
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name?.toLowerCase().includes(q));
    }

    if (statusFilter) {
      const isActiveFilter = statusFilter === "active";
      result = result.filter((c) => (c.isActive ?? true) === isActiveFilter);
    }

    return result;
  }, [categories, search, statusFilter]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

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
          Category Management
        </h1>
        <p className="text-xs text-muted-gray font-semibold mt-1">
          Create, update and manage product categories.
        </p>
      </div>

      {/* Analytics Stats Section */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div
          onClick={() => setStatusFilter("")}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            !statusFilter ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-widest">Total</span>
            <div className="p-1.5 rounded-xl bg-primary/5 text-primary">
              <Tag size={15} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.total}</span>
        </div>

        <div
          onClick={() => setStatusFilter("active")}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            statusFilter === "active" ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold text-emerald-600 uppercase tracking-widest">Active</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle size={15} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.active}</span>
        </div>

        <div
          onClick={() => setStatusFilter("inactive")}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            statusFilter === "inactive" ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold text-rose-600 uppercase tracking-widest">Inactive</span>
            <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600">
              <XCircle size={15} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.inactive}</span>
        </div>
      </div>

      {/* Add Category Card */}
      <div className="bg-white border border-light-border/60 rounded-3xl p-5 mb-6 shadow-2xs relative overflow-hidden">
        <h2 className="text-xs font-extrabold text-dark-navy mb-4 uppercase tracking-widest flex items-center gap-2">
          <PlusCircle size={16} className="text-primary" />
          Add New Category
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="relative flex-2 w-full">
            <label className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block mb-1">Category Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                <Tag size={15} />
              </span>
              <input
                type="text"
                placeholder="Enter category name (e.g. Electronics, Clothing)"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-light-border bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy h-[38px]"
              />
            </div>
          </div>

          <div className="relative flex-1 w-full sm:max-w-[180px]">
            <label className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest block mb-1">Commission Rate (%)</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={categoryCommission}
              onChange={(e) => setCategoryCommission(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-light-border bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy h-[38px]"
              min="0"
              max="100"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer h-[38px] active:scale-95 shrink-0 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Add Category
          </button>
        </form>
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
              placeholder="Search categories by name..."
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

          {/* Status Filter */}
          <div className="relative min-w-[140px] z-30">
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-light-border bg-white text-xs font-bold text-dark-navy hover:bg-slate-50 transition-all outline-none cursor-pointer h-[36px] flex items-center justify-between shadow-2xs"
            >
              <span>
                {statusFilter === "" && "All Statuses"}
                {statusFilter === "active" && "Active"}
                {statusFilter === "inactive" && "Inactive"}
              </span>
              <ChevronDown size={12} className={`text-muted-gray transition-transform duration-300 ${statusDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {statusDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setStatusDropdownOpen(false)}></div>
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-light-border/60 rounded-2xl shadow-md p-1.5 z-20 animate-scaleUp text-left">
                  {[
                    { key: "", label: "All Statuses", icon: Inbox, color: "text-primary bg-indigo-50/50" },
                    { key: "active", label: "Active", icon: CheckCircle, color: "text-emerald-500 bg-emerald-50/50" },
                    { key: "inactive", label: "Inactive", icon: XCircle, color: "text-rose-500 bg-rose-50/50" }
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

          {/* Reset Filters */}
          {(search || statusFilter) && (
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

      {/* Categories Table */}
      <div className="bg-white border border-light-border/60 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-light-border/40 flex justify-between items-center bg-slate-50/20">
          <h2 className="text-xs font-extrabold text-dark-navy uppercase tracking-widest">All Categories</h2>
          <span className="text-xs font-bold text-muted-gray">
            Showing {filteredCategories.length} of {categories.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8 mb-4" />
            <p className="text-xs font-bold text-muted-gray animate-pulse">Fetching categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-12 h-12 text-muted-gray/50 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-dark-navy uppercase tracking-widest">No Categories Found</h3>
            <p className="text-xs font-semibold text-muted-gray mt-1">Try resetting filters or adjusting search keys.</p>
            {(search || statusFilter) && (
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/65 text-muted-gray border-b border-light-border/40 text-[10px] font-extrabold uppercase tracking-widest">
                  <th className="py-3.5 px-6 text-left">Category Name</th>
                  <th className="py-3.5 px-6 text-center">Commission Rate (%)</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center w-[180px]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-light-border/40 text-sm font-semibold text-dark-navy">
                {paginatedCategories.map((category) => {
                  const isEditing = editingId === category._id;

                  if (isEditing) {
                    return (
                      <tr
                        key={category._id}
                        className="bg-slate-50/40 border-y border-light-border/60 transition-all duration-300 animate-fadeIn"
                      >
                        <td colSpan={4} className="py-5 px-6">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-primary uppercase tracking-widest">
                              <Edit3 size={14} />
                              <span>Editing Category: <span className="text-dark-navy underline decoration-primary/45">{category.name}</span></span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Category Name</label>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                                    <Tag size={14} />
                                  </span>
                                  <input
                                    type="text"
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy transition-all duration-300 bg-white"
                                    placeholder="Enter category name"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Commission Rate (%)</label>
                                <input
                                  type="number"
                                  value={editCategoryCommission}
                                  onChange={(e) => setEditCategoryCommission(e.target.value)}
                                  className="w-full px-4 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy transition-all duration-300 bg-white"
                                  placeholder="Enter commission rate"
                                  min="0"
                                  max="100"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-border/40 mt-1">
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditCategoryName("");
                                }}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-dark-navy text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <X size={14} />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateInline(category._id)}
                                disabled={submitting}
                                className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={category._id} className="hover:bg-slate-50/30 transition-all duration-200">
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-dark-navy text-sm">{category.name}</span>
                      </td>

                      <td className="py-3.5 px-6 text-center">
                        <span className="font-mono text-[#0F9D8A] text-xs font-extrabold">{category.commissionPercentage ?? 5}%</span>
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-center gap-2.5">
                          <label className={`relative inline-flex items-center cursor-pointer ${actionLoadingId === category._id ? "opacity-50 pointer-events-none" : ""}`}>
                            <input
                              type="checkbox"
                              checked={category.isActive ?? true}
                              onChange={() => handleToggleStatus(category._id)}
                              disabled={actionLoadingId === category._id || submitting}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[14px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                              category.isActive ?? true
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                            }`}
                          >
                            {actionLoadingId === category._id && <Loader2 size={10} className="animate-spin mr-1" />}
                            {(category.isActive ?? true) ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            disabled={actionLoadingId === category._id || submitting}
                            className="p-1.5 text-muted-gray hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                            title="Edit Category"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            disabled={actionLoadingId === category._id || submitting}
                            className="p-1.5 text-muted-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[28px] min-h-[28px]"
                            title="Delete Category"
                          >
                            {actionLoadingId === category._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-light-border/40 bg-white px-6 py-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-xl border border-light-border bg-white px-4 py-2 text-xs font-bold text-dark-navy hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-xl border border-light-border bg-white px-4 py-2 text-xs font-bold text-dark-navy hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-gray">
                      Showing <span className="font-bold text-dark-navy">{Math.min(filteredCategories.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
                      <span className="font-bold text-dark-navy">{Math.min(filteredCategories.length, currentPage * itemsPerPage)}</span> of{" "}
                      <span className="font-bold text-dark-navy">{filteredCategories.length}</span> categories
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-xl shadow-2xs border border-light-border" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-xl px-2.5 py-2 text-muted-gray hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border-r border-light-border"
                      >
                        <span className="sr-only">Previous</span>
                        &lsaquo;
                      </button>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-xs font-bold transition-all duration-300 ${
                              currentPage === pageNum
                                ? "z-10 bg-primary text-white"
                                : "text-dark-navy hover:bg-slate-50"
                            } ${pageNum !== totalPages ? "border-r border-light-border" : ""}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-xl px-2.5 py-2 text-muted-gray hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border-l border-light-border"
                      >
                        <span className="sr-only">Next</span>
                        &rsaquo;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
