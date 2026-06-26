import React, { useEffect, useState, useMemo } from "react";
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
  Plus
} from "lucide-react";

const CategoryManagement = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
      await addCategory({
        name: categoryName,
      });

      showToast("Category added successfully", "success");
      setCategoryName("");
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.msg || "Failed to add category", "error");
      console.log(err);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setEditCategoryName(category.name);
  };

  const handleUpdateInline = async (id) => {
    if (!editCategoryName.trim()) {
      showToast("Category name cannot be empty", "error");
      return;
    }

    try {
      await updateCategory(id, {
        name: editCategoryName,
      });

      showToast("Category updated successfully", "success");
      setEditingId(null);
      setEditCategoryName("");
      fetchCategories();
    } catch (err) {
      showToast("Failed to update category", "error");
      console.log(err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleCategoryStatus(id);
      showToast("Category status updated successfully", "success");
      fetchCategories();
    } catch (err) {
      showToast("Failed to update category status", "error");
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmDelete) return;

    try {
      await deleteCategory(id);
      showToast("Category deleted successfully", "success");
      fetchCategories();
    } catch (err) {
      showToast("Failed to delete category", "error");
      console.log(err);
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
          Category Management
        </h1>
        <p className="text-[13px] font-normal text-gray-550 mt-1 leading-relaxed">
          Create, update and manage product categories.
        </p>
      </div>

      {/* Analytics Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div
          onClick={() => {
            setStatusFilter("");
          }}
          className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
            !statusFilter ? "border-[#088178] ring-2 ring-[#088178]/5" : "border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-gray-500">Total Categories</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Tag size={15} />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.total}</span>
        </div>

        <div
          onClick={() => setStatusFilter("active")}
          className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
            statusFilter === "active" ? "border-[#088178] ring-2 ring-[#088178]/5" : "border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-gray-500">Active Categories</span>
            <div className="p-1.5 rounded-lg bg-green-50 text-green-600">
              <CheckCircle size={15} />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.active}</span>
        </div>

        <div
          onClick={() => setStatusFilter("inactive")}
          className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
            statusFilter === "inactive" ? "border-[#088178] ring-2 ring-[#088178]/5" : "border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-gray-500">Inactive Categories</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-650">
              <XCircle size={15} />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.inactive}</span>
        </div>
      </div>

      {/* Add Category Card */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 mb-6 shadow-sm shadow-slate-100/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#088178]"></div>

        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <PlusCircle size={16} className="text-[#088178]" />
          Add New Category
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
              <Tag size={15} />
            </span>
            <input
              type="text"
              placeholder="Enter category name (e.g. Electronics, Clothing)"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 border border-slate-100 rounded-lg focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all h-[38px]"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#088178] hover:bg-[#088178]/90 text-white text-sm font-medium rounded-lg shadow-sm transition-all cursor-pointer h-[38px]"
          >
            <Plus size={15} />
            Add Category
          </button>
        </form>
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
              placeholder="Search categories by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 bg-slate-50/70 border border-slate-100 rounded-lg focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all"
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

          {/* Status Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-100 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>

          {/* Reset Filters */}
          {(search || statusFilter) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 border border-red-100 text-red-500 hover:bg-red-50/40 py-2 px-3.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer h-[32px]"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm shadow-slate-100/30">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
          <h2 className="text-base font-semibold text-slate-800">All Categories</h2>
          <span className="text-[13px] font-normal text-gray-500">
            Showing {filteredCategories.length} of {categories.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#088178] w-8 h-8 mb-4" />
            <p className="text-xs font-normal text-gray-500 animate-pulse">Fetching categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center shadow-sm">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Categories Found</h3>
            <p className="text-[13px] font-normal text-gray-500 mt-1">Try resetting filters or adjusting search keys.</p>
            {(search || statusFilter) && (
              <button
                onClick={handleResetFilters}
                className="mt-3 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/65 text-gray-500 border-b border-slate-100 text-[13px] font-normal">
                  <th className="py-3 px-6 text-left">Category Name</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center w-[180px]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-[14px] font-normal text-slate-800">
                {filteredCategories.map((category) => {
                  const isEditing = editingId === category._id;

                  if (isEditing) {
                    return (
                      <tr
                        key={category._id}
                        className="bg-slate-50/80 border-y border-slate-100 transition-all duration-300 animate-fadeIn"
                      >
                        <td colSpan={3} className="py-5 px-6">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#088178]">
                              <Edit3 size={14} />
                              <span>Editing Category: <span className="text-slate-800 underline decoration-slate-300">{category.name}</span></span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[13px] font-normal text-gray-500">Category Name</label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                                  <Tag size={14} />
                                </span>
                                <input
                                  type="text"
                                  value={editCategoryName}
                                  onChange={(e) => setEditCategoryName(e.target.value)}
                                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all duration-300 shadow-sm"
                                  placeholder="Enter category name"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100/70 mt-1">
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditCategoryName("");
                                }}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                              >
                                <X size={14} />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateInline(category._id)}
                                className="px-4 py-2 bg-[#088178] hover:bg-[#088178]/90 text-white text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                              >
                                <Check size={14} />
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={category._id} className="hover:bg-slate-50/50 transition-all duration-200">
                      <td className="py-3.5 px-6">
                        <span className="font-medium text-slate-800 text-sm">{category.name}</span>
                      </td>

                      <td className="py-3.5 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-normal ${
                            category.isActive ?? true
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-red-50 text-red-755 border border-red-100"
                          }`}
                        >
                          {(category.isActive ?? true) ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(category._id)}
                            className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                              (category.isActive ?? true)
                                ? "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                                : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                            }`}
                            title={(category.isActive ?? true) ? "Deactivate Category" : "Activate Category"}
                          >
                            {(category.isActive ?? true) ? <XCircle size={15} /> : <CheckCircle size={15} />}
                          </button>
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
