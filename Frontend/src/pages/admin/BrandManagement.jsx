import React, { useEffect, useState, useMemo } from "react";
import {
  addBrand,
  getBrands,
  updateBrand,
  deleteBrand,
  getCategories,
  toggleBrandStatus,
} from "../../api/CategoryAndBrandApi";
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
  TrendingUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const BrandManagement = () => {
  const [brandName, setBrandName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editBrandName, setEditBrandName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategoryFilter, selectedStatusFilter]);

  useEffect(() => {
    if (categories.length > 0) {
      const initial = {};
      categories.forEach((c) => {
        initial[c._id] = false;
      });
      setExpandedCategories(initial);
    }
  }, [categories]);

  const toggleCategoryExpand = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Memoized stats calculation for analyzing
  const stats = useMemo(() => {
    const total = brands.length;
    const active = brands.filter((v) => v.isActive ?? true).length;
    const inactive = total - active;
    const uniqueCats = new Set(
      brands
        .map((v) => v.categoryId?._id || v.categoryId)
        .filter(Boolean)
    ).size;

    return { total, active, inactive, uniqueCats };
  }, [brands]);

  // Memoized filtered brands
  const filteredBrands = useMemo(() => {
    let result = [...brands];

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
  }, [brands, search, selectedCategoryFilter, selectedStatusFilter]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBrands.slice(start, start + itemsPerPage);
  }, [filteredBrands, currentPage, itemsPerPage]);

  // Group brands by category
  const groupedBrands = useMemo(() => {
    const groups = {};
    categories.forEach((cat) => {
      groups[cat._id] = {
        categoryId: cat._id,
        categoryName: cat.name,
        brands: [],
      };
    });
    groups["uncategorized"] = {
      categoryId: "uncategorized",
      categoryName: "Uncategorized",
      brands: [],
    };
    filteredBrands.forEach((brand) => {
      const catId = brand.categoryId?._id || brand.categoryId || "uncategorized";
      if (!groups[catId]) {
        groups[catId] = {
          categoryId: catId,
          categoryName: brand.categoryId?.name || "Uncategorized",
          brands: [],
        };
      }
      groups[catId].brands.push(brand);
    });
    let result = Object.values(groups);
    if (groups["uncategorized"].brands.length === 0) {
      result = result.filter((g) => g.categoryId !== "uncategorized");
    }
    if (selectedCategoryFilter) {
      result = result.filter((g) => g.categoryId === selectedCategoryFilter);
    }
    if (search.trim() || selectedStatusFilter) {
      result = result.filter((g) => g.brands.length > 0);
    }
    return result;
  }, [brands, categories, filteredBrands, selectedCategoryFilter, search, selectedStatusFilter]);

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

  const fetchBrands = async () => {
    try {
      const response = await getBrands();
      setBrands(response.data.brands || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([fetchCategories(), fetchBrands()]);
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

    if (!brandName || !categoryId) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      await addBrand({
        name: brandName,
        categoryId,
      });

      showToast("Brand added successfully", "success");
      setBrandName("");
      setCategoryId("");
      fetchBrands();
    } catch (err) {
      showToast(err.response?.data?.msg || "Failed to add brand", "error");
      console.log(err);
    }
  };

  const handleEdit = (brand) => {
    setEditingId(brand._id);
    setEditBrandName(brand.name);
    setEditCategoryId(brand.categoryId?._id || brand.categoryId);
  };

  const handleUpdateInline = async (id) => {
    if (!editBrandName || !editCategoryId) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      await updateBrand(id, {
        name: editBrandName,
        categoryId: editCategoryId,
      });

      showToast("Brand updated successfully", "success");
      setEditingId(null);
      setEditBrandName("");
      setEditCategoryId("");
      fetchBrands();
    } catch (err) {
      showToast(err.response?.data?.msg || "Failed to update brand", "error");
      console.log(err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleBrandStatus(id);
      showToast("Brand status updated successfully", "success");
      fetchBrands();
    } catch (err) {
      showToast("Failed to update brand status", "error");
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this brand?",
    );

    if (!confirmDelete) return;

    try {
      await deleteBrand(id);
      showToast("Brand deleted successfully", "success");
      fetchBrands();
    } catch (err) {
      showToast("Failed to delete brand", "error");
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
          Brand Management
        </h1>
        <p className="text-[13px] font-normal text-gray-500 mt-1 leading-relaxed">
          Manage product brands and brands.
        </p>
      </div>

      {/* Analytics Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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
            <span className="text-[11px] sm:text-[13px] font-normal text-gray-500">Total Brands</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-650">
              <Layers size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.total}</span>
        </div>

        <div
          onClick={() => setSelectedStatusFilter("active")}
          className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
            selectedStatusFilter === "active" ? "border-[#088178] ring-2 ring-[#088178]/5" : "border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-[13px] font-normal text-gray-500">Active Brands</span>
            <div className="p-1.5 rounded-lg bg-green-50 text-green-600">
              <CheckCircle size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.active}</span>
        </div>

        <div
          onClick={() => setSelectedStatusFilter("inactive")}
          className={`flex flex-col p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
            selectedStatusFilter === "inactive" ? "border-[#088178] ring-2 ring-[#088178]/5" : "border-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-[13px] font-normal text-gray-500">Inactive Brands</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <XCircle size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.inactive}</span>
        </div>

        <div className="flex flex-col p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-[13px] font-normal text-gray-500">Categories</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-bold text-slate-800 mt-2 leading-tight">{stats.uniqueCats}</span>
        </div>
      </div>

      {/* Add Brand Form Card */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 mb-6 shadow-sm shadow-slate-100/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#088178]"></div>
        
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <PlusCircle size={16} className="text-[#088178]" />
          Add Brand / Brand
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

          {/* Brand Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
              <Layers size={15} />
            </span>
            <input
              type="text"
              placeholder="Enter Brand Name (e.g. Apple, Sony)"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-100 rounded-lg focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all h-[38px]"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#088178] hover:bg-[#088178]/90 text-white text-sm font-medium rounded-lg shadow-sm transition-all cursor-pointer h-[38px]"
          >
            <Plus size={15} />
            Add Brand
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
              placeholder="Search brands by name or category..."
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

      {/* Brands Registry Table */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm shadow-slate-100/30">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
          <h2 className="text-base font-semibold text-slate-800">All Brands</h2>
          <span className="text-[13px] font-normal text-gray-500">
            Showing {filteredBrands.length} of {brands.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#088178] w-8 h-8 mb-4" />
            <p className="text-xs font-normal text-gray-500 animate-pulse">Fetching brands...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-12 text-center shadow-sm">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No Brands Found</h3>
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
          <div className="space-y-4">
            {groupedBrands.map((group) => {
              const catId = group.categoryId;
              const isExpanded = !!expandedCategories[catId];
              
              return (
                <div key={catId} className="border border-slate-100 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                  {/* Accordion Group Header */}
                  <div
                    onClick={() => toggleCategoryExpand(catId)}
                    className="flex items-center justify-between px-6 py-4 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors duration-200 border-b border-slate-100 select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-800 text-[14px]">
                        {group.categoryName}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#088178]/10 text-[#088178] border border-[#088178]/20">
                        {group.brands.length} {group.brands.length === 1 ? "Brand" : "Brands"}
                      </span>
                    </div>
                    <div className="text-gray-400 hover:text-slate-600 transition-colors duration-200">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Group Brands Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      {group.brands.length === 0 ? (
                        <div className="py-6 text-center text-gray-400 text-[13px] font-normal">
                          No brands in this category.
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/20 text-gray-500 border-b border-slate-100 text-[12px] font-medium uppercase tracking-wider">
                              <th className="py-3 px-6">Brand Name</th>
                              <th className="py-3 px-6 text-center w-[120px]">Status</th>
                              <th className="py-3 px-6 text-center w-[180px]">Actions</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100 text-[14px] font-normal text-slate-800">
                            {group.brands.map((brand) => {
                              const isEditing = editingId === brand._id;

                              if (isEditing) {
                                return (
                                  <tr
                                    key={brand._id}
                                    className="bg-slate-50/80 border-y border-slate-100 transition-all duration-300 animate-fadeIn"
                                  >
                                    <td colSpan={3} className="py-5 px-6">
                                      <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#088178]">
                                          <Edit3 size={14} />
                                          <span>Editing Brand: <span className="text-slate-800 underline decoration-slate-300">{brand.name}</span></span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-normal text-gray-500">Brand Name</label>
                                            <div className="relative">
                                              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                                                <Layers size={14} />
                                              </span>
                                              <input
                                                type="text"
                                                value={editBrandName}
                                                onChange={(e) => setEditBrandName(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-normal text-slate-800 transition-all duration-300 shadow-sm"
                                                placeholder="Enter Brand Name"
                                              />
                                            </div>
                                          </div>

                                          <div className="flex flex-col gap-1.5">
                                            <label className="text-[13px] font-normal text-gray-500">Category Type</label>
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

                                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100/70 mt-1">
                                          <button
                                            onClick={() => {
                                              setEditingId(null);
                                              setEditBrandName("");
                                              setEditCategoryId("");
                                            }}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer flex items-center gap-1.5"
                                          >
                                            <X size={14} />
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => handleUpdateInline(brand._id)}
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
                                <tr key={brand._id} className="hover:bg-slate-50/50 transition-all duration-200">
                                  <td className="py-3.5 px-6">
                                    <span className="font-medium text-slate-800 text-sm">{brand.name}</span>
                                  </td>

                                  <td className="py-3.5 px-6 text-center">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-normal ${
                                        brand.isActive ?? true
                                          ? "bg-green-50 text-green-700 border border-green-100"
                                          : "bg-red-50 text-red-700 border border-red-100"
                                      }`}
                                    >
                                      {(brand.isActive ?? true) ? "Active" : "Inactive"}
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-6">
                                    <div className="flex justify-center gap-2">
                                      <button
                                        onClick={() => handleToggleStatus(brand._id)}
                                        className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                                          (brand.isActive ?? true)
                                            ? "text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                                            : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                                        }`}
                                        title={(brand.isActive ?? true) ? "Deactivate Brand" : "Activate Brand"}
                                      >
                                        {(brand.isActive ?? true) ? <XCircle size={15} /> : <CheckCircle size={15} />}
                                      </button>
                                      <button
                                        onClick={() => handleEdit(brand)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 cursor-pointer"
                                        title="Edit Brand"
                                      >
                                        <Edit3 size={15} />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(brand._id)}
                                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 cursor-pointer"
                                        title="Delete Brand"
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
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandManagement;
