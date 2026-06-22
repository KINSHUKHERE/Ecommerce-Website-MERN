import React, { useEffect, useState, useMemo } from "react";
import {
  addVariant,
  getVariants,
  updateVariant,
  deleteVariant,
  getCategories,
} from "../../api/CategoryAndVarientApi";
import { 
  Tag, 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Inbox, 
  Loader2, 
  Check, 
  X,
  PlusCircle,
  Search,
  RotateCcw,
  CheckCircle,
  XCircle,
  TrendingUp
} from "lucide-react";

const VariantManagement = () => {
  const [variantName, setVariantName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editVariantName, setEditVariantName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

  // Memoized stats calculation for analyzing
  const stats = useMemo(() => {
    const total = variants.length;
    const active = variants.filter((v) => v.isActive ?? true).length;
    const inactive = total - active;
    const uniqueCats = new Set(
      variants
        .map((v) => v.categoryId?._id || v.categoryId)
        .filter(Boolean)
    ).size;

    return { total, active, inactive, uniqueCats };
  }, [variants]);

  // Memoized filtered variants
  const filteredVariants = useMemo(() => {
    let result = [...variants];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.name?.toLowerCase().includes(q) ||
          v.categoryId?.name?.toLowerCase().includes(q)
      );
    }

    if (selectedCategoryFilter) {
      result = result.filter(
        (v) => (v.categoryId?._id || v.categoryId) === selectedCategoryFilter
      );
    }

    if (selectedStatusFilter) {
      const isActiveFilter = selectedStatusFilter === "active";
      result = result.filter((v) => (v.isActive ?? true) === isActiveFilter);
    }

    return result;
  }, [variants, search, selectedCategoryFilter, selectedStatusFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategoryFilter("");
    setSelectedStatusFilter("");
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchVariants = async () => {
    try {
      const response = await getVariants();
      setVariants(response.data.variants || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([fetchCategories(), fetchVariants()]);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
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

    if (!variantName || !categoryId) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      await addVariant({
        name: variantName,
        categoryId,
      });

      showToast("Variant added successfully", "success");
      setVariantName("");
      setCategoryId("");
      fetchVariants();
    } catch (err) {
      showToast("Failed to add variant", "error");
      console.log(err);
    }
  };

  const handleEdit = (variant) => {
    setEditingId(variant._id);
    setEditVariantName(variant.name);
    setEditCategoryId(variant.categoryId?._id || variant.categoryId);
  };

  const handleUpdateInline = async (id) => {
    if (!editVariantName || !editCategoryId) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      await updateVariant(id, {
        name: editVariantName,
        categoryId: editCategoryId,
      });

      showToast("Variant updated successfully", "success");
      setEditingId(null);
      setEditVariantName("");
      setEditCategoryId("");
      fetchVariants();
    } catch (err) {
      showToast("Failed to update variant", "error");
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this variant?",
    );

    if (!confirmDelete) return;

    try {
      await deleteVariant(id);
      showToast("Variant deleted successfully", "success");
      fetchVariants();
    } catch (err) {
      showToast("Failed to delete variant", "error");
      console.log(err);
    }
  };

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
          Variant Management
        </h1>
        <p className="text-[13px] font-normal text-gray-500 mt-1 leading-relaxed">
          Manage product variants and brands.
        </p>
      </div>

      {/* Analytics Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => {
            setSelectedStatusFilter("");
            setSelectedCategoryFilter("");
          }}
          className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
            !selectedStatusFilter && !selectedCategoryFilter ? "border-[#088178] ring-2 ring-[#088178]/5" : "border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-gray-500">Total Variants</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-650">
              <Layers size={16} />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.total}</span>
        </div>

        <div
          onClick={() => setSelectedStatusFilter("active")}
          className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
            selectedStatusFilter === "active" ? "border-[#088178] ring-2 ring-[#088178]/5" : "border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-gray-500">Active Variants</span>
            <div className="p-1.5 rounded-lg bg-green-50 text-green-600">
              <CheckCircle size={16} />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.active}</span>
        </div>

        <div
          onClick={() => setSelectedStatusFilter("inactive")}
          className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
            selectedStatusFilter === "inactive" ? "border-[#088178] ring-2 ring-[#088178]/5" : "border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-gray-500">Inactive Variants</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <XCircle size={16} />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.inactive}</span>
        </div>

        <div className="flex flex-col p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-normal text-gray-500">Categories</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <span className="text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.uniqueCats}</span>
        </div>
      </div>

      {/* Add Variant Form Card */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 mb-6 shadow-sm shadow-slate-100/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#088178]"></div>
        
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <PlusCircle size={16} className="text-[#088178]" />
          Add Variant / Brand
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Dropdown */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
              <Tag size={15} />
            </span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-100 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none transition-all text-sm font-normal text-slate-800 appearance-none cursor-pointer rounded-lg h-[38px]"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>

          {/* Variant Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
              <Layers size={15} />
            </span>
            <input
              type="text"
              placeholder="Enter Variant Name (e.g. Apple, Sony)"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-100 rounded-lg focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all h-[38px]"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#088178] hover:bg-[#088178]/90 text-white text-sm font-medium rounded-lg shadow-sm transition-all cursor-pointer h-[38px]"
          >
            <Plus size={15} />
            Add Variant
          </button>
        </form>
      </div>

      {/* Search & Filters Block */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 mb-6 shadow-sm shadow-slate-100/30">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search variants by name or category..."
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

          {/* Category Filter */}
          <div className="relative min-w-[160px]">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-100 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
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
          {(search || selectedCategoryFilter || selectedStatusFilter) && (
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

      {/* Variants Registry Table */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm shadow-slate-100/30">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
          <h2 className="text-base font-semibold text-slate-800">All Variants</h2>
          <span className="text-[13px] font-normal text-gray-500">
            Showing {filteredVariants.length} of {variants.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#088178] w-8 h-8 mb-4" />
            <p className="text-xs font-normal text-gray-500 animate-pulse">Fetching variants...</p>
          </div>
        ) : filteredVariants.length === 0 ? (
          <div className="p-12 text-center shadow-sm">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Variants Found</h3>
            <p className="text-[13px] font-normal text-gray-500 mt-1">Try resetting filters or adjusting search keys.</p>
            {(search || selectedCategoryFilter || selectedStatusFilter) && (
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
                  <th className="py-3 px-6">Variant Name</th>
                  <th className="py-3 px-6">Category Type</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center w-[180px]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-[14px] font-normal text-slate-800">
                {filteredVariants.map((variant) => {
                  const isEditing = editingId === variant._id;

                  if (isEditing) {
                    return (
                      <tr
                        key={variant._id}
                        className="bg-slate-50/80 border-y border-slate-100 transition-all duration-300 animate-fadeIn"
                      >
                        <td colSpan={4} className="py-5 px-6">
                          <div className="flex flex-col gap-4">
                            {/* Title indicator */}
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#088178]">
                              <Edit3 size={14} />
                              <span>Editing Variant: <span className="text-slate-800 underline decoration-slate-300">{variant.name}</span></span>
                            </div>

                            {/* Grid/Flex Layout for Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Variant Name Input */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-normal text-gray-500">
                                  Variant Name
                                </label>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                                    <Layers size={14} />
                                  </span>
                                  <input
                                    type="text"
                                    value={editVariantName}
                                    onChange={(e) => setEditVariantName(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all duration-300 shadow-sm"
                                    placeholder="Enter Variant Name"
                                  />
                                </div>
                              </div>

                              {/* Category Dropdown */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-normal text-gray-500">
                                  Category Type
                                </label>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                                    <Tag size={14} />
                                  </span>
                                  <select
                                    value={editCategoryId}
                                    onChange={(e) => setEditCategoryId(e.target.value)}
                                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 appearance-none cursor-pointer shadow-sm"
                                  >
                                    <option value="">Select Category</option>
                                    {categories.map((category) => (
                                      <option key={category._id} value={category._id}>
                                        {category.name}
                                      </option>
                                    ))}
                                  </select>
                                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100/70 mt-1">
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditVariantName("");
                                  setEditCategoryId("");
                                }}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                              >
                                <X size={14} />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateInline(variant._id)}
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
                    <tr key={variant._id} className="hover:bg-slate-50/50 transition-all duration-200">
                      
                      {/* Variant Name Column */}
                      <td className="py-3.5 px-6">
                        <span className="font-medium text-slate-800 text-sm">{variant.name}</span>
                      </td>

                      {/* Category Column */}
                      <td className="py-3.5 px-6 text-gray-500 text-[13px] font-normal">
                        {variant.categoryId?.name || "N/A"}
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-normal ${
                            variant.isActive ?? true
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                          }`}
                        >
                          {(variant.isActive ?? true) ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(variant)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 cursor-pointer"
                            title="Edit Variant"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(variant._id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 cursor-pointer"
                            title="Delete Variant"
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

export default VariantManagement;
