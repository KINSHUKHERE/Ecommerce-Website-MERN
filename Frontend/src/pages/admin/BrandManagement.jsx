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
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [filterCatDropdownOpen, setFilterCatDropdownOpen] = useState(false);
  const [filterStatusDropdownOpen, setFilterStatusDropdownOpen] = useState(false);
  const [editCatDropdownOpen, setEditCatDropdownOpen] = useState(false);

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
          Brand Management
        </h1>
        <p className="text-xs text-muted-gray font-semibold mt-1">
          Manage product brands and configurations.
        </p>
      </div>

      {/* Analytics Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div
          onClick={() => {
            setSelectedStatusFilter("");
            setSelectedCategoryFilter("");
          }}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            !selectedStatusFilter && !selectedCategoryFilter ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-widest">Total</span>
            <div className="p-1.5 rounded-xl bg-primary/5 text-primary">
              <Layers size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.total}</span>
        </div>

        <div
          onClick={() => setSelectedStatusFilter("active")}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            selectedStatusFilter === "active" ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold text-emerald-600 uppercase tracking-widest">Active</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.active}</span>
        </div>

        <div
          onClick={() => setSelectedStatusFilter("inactive")}
          className={`flex flex-col p-4 bg-white border rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300 cursor-pointer ${
            selectedStatusFilter === "inactive" ? "border-primary ring-2 ring-primary/5" : "border-light-border/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold text-rose-600 uppercase tracking-widest">Inactive</span>
            <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600">
              <XCircle size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.inactive}</span>
        </div>

        <div className="flex flex-col p-4 bg-white border border-light-border/60 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold text-muted-gray uppercase tracking-widest">Categories</span>
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-650">
              <TrendingUp size={16} />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold text-dark-navy mt-2 leading-tight">{stats.uniqueCats}</span>
        </div>
      </div>

      {/* Add Brand Form Card */}
      <div className="bg-white border border-light-border/60 rounded-3xl p-5 mb-6 shadow-2xs relative overflow-hidden">
        <h2 className="text-xs font-extrabold text-dark-navy mb-4 uppercase tracking-widest flex items-center gap-2">
          <PlusCircle size={16} className="text-primary" />
          Add Brand Name
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Dropdown */}
          <div className="relative z-30">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none z-10">
              <Tag size={15} />
            </span>
            <button
              type="button"
              onClick={() => {
                setCatDropdownOpen(!catDropdownOpen);
                setFilterCatDropdownOpen(false);
                setFilterStatusDropdownOpen(false);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-light-border bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-xs font-semibold text-dark-navy h-[38px] cursor-pointer flex items-center justify-between text-left shadow-2xs"
            >
              <span className="truncate">
                {categoryId
                  ? (categories.find(c => c._id === categoryId)?.name || "Select Category")
                  : "Select Category"}
              </span>
              <ChevronDown size={12} className={`text-muted-gray transition-transform duration-300 ${catDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {catDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setCatDropdownOpen(false)}></div>
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-light-border/60 rounded-2xl shadow-md p-1.5 z-20 animate-scaleUp text-left max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryId("");
                      setCatDropdownOpen(false);
                    }}
                    className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-all text-left ${
                      categoryId === "" ? "bg-primary/5 text-primary font-black" : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                    }`}
                  >
                    <div className="w-5.5 h-5.5 rounded-md flex items-center justify-center text-primary bg-indigo-50/50 transition-all duration-200 group-hover:scale-105">
                      <Tag className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold transition-colors">
                      Select Category
                    </span>
                  </button>

                  {categories.map((category) => {
                    const isSelected = categoryId === category._id;
                    return (
                      <button
                        key={category._id}
                        type="button"
                        onClick={() => {
                          setCategoryId(category._id);
                          setCatDropdownOpen(false);
                        }}
                        className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-all text-left mt-0.5 ${
                          isSelected ? "bg-primary/5 text-primary font-black" : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                        }`}
                      >
                        <div className="w-5.5 h-5.5 rounded-md flex items-center justify-center text-primary bg-indigo-50/50 transition-all duration-200 group-hover:scale-105">
                          <Tag className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-bold transition-colors">
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Brand Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
              <Layers size={15} />
            </span>
            <input
              type="text"
              placeholder="Enter Brand Name (e.g. Apple, Sony)"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy h-[38px]"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer h-[38px] active:scale-95"
          >
            <Plus size={15} />
            Add Brand
          </button>
        </form>
      </div>

      {/* Search & Filters Block */}
      <div className="bg-white border border-light-border/60 rounded-2xl p-4 mb-6 shadow-2xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search brands by name or category..."
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

          {/* Category Filter */}
          <div className="relative min-w-[160px] z-30">
            <button
              type="button"
              onClick={() => {
                setFilterCatDropdownOpen(!filterCatDropdownOpen);
                setFilterStatusDropdownOpen(false);
                setCatDropdownOpen(false);
              }}
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-light-border bg-white text-xs font-bold text-dark-navy hover:bg-slate-50 transition-all outline-none cursor-pointer h-[36px] flex items-center justify-between shadow-2xs"
            >
              <span className="truncate">
                {selectedCategoryFilter
                  ? (categories.find(c => c._id === selectedCategoryFilter)?.name || "All Categories")
                  : "All Categories"}
              </span>
              <ChevronDown size={12} className={`text-muted-gray transition-transform duration-300 ${filterCatDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {filterCatDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setFilterCatDropdownOpen(false)}></div>
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-light-border/60 rounded-2xl shadow-md p-1.5 z-20 animate-scaleUp text-left max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryFilter("");
                      setFilterCatDropdownOpen(false);
                    }}
                    className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-all text-left ${
                      selectedCategoryFilter === "" ? "bg-primary/5 text-primary font-black" : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                    }`}
                  >
                    <div className="w-5.5 h-5.5 rounded-md flex items-center justify-center text-primary bg-indigo-50/50 transition-all duration-200 group-hover:scale-105">
                      <Tag className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold transition-colors">
                      All Categories
                    </span>
                  </button>

                  {categories.map((c) => {
                    const isSelected = selectedCategoryFilter === c._id;
                    return (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryFilter(c._id);
                          setFilterCatDropdownOpen(false);
                        }}
                        className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-all text-left mt-0.5 ${
                          isSelected ? "bg-primary/5 text-primary font-black" : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                        }`}
                      >
                        <div className="w-5.5 h-5.5 rounded-md flex items-center justify-center text-primary bg-indigo-50/50 transition-all duration-200 group-hover:scale-105">
                          <Tag className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-bold transition-colors">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[140px] z-30">
            <button
              type="button"
              onClick={() => {
                setFilterStatusDropdownOpen(!filterStatusDropdownOpen);
                setFilterCatDropdownOpen(false);
                setCatDropdownOpen(false);
              }}
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-light-border bg-white text-xs font-bold text-dark-navy hover:bg-slate-50 transition-all outline-none cursor-pointer h-[36px] flex items-center justify-between shadow-2xs"
            >
              <span>
                {selectedStatusFilter === "" && "All Statuses"}
                {selectedStatusFilter === "active" && "Active"}
                {selectedStatusFilter === "inactive" && "Inactive"}
              </span>
              <ChevronDown size={12} className={`text-muted-gray transition-transform duration-300 ${filterStatusDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {filterStatusDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10 bg-transparent" onClick={() => setFilterStatusDropdownOpen(false)}></div>
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-light-border/60 rounded-2xl shadow-md p-1.5 z-20 animate-scaleUp text-left">
                  {[
                    { key: "", label: "All Statuses", icon: ShoppingBag, color: "text-primary bg-indigo-50/50" },
                    { key: "active", label: "Active", icon: CheckCircle, color: "text-emerald-500 bg-emerald-50/50" },
                    { key: "inactive", label: "Inactive", icon: XCircle, color: "text-rose-500 bg-rose-50/50" }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedStatusFilter === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setSelectedStatusFilter(item.key);
                          setFilterStatusDropdownOpen(false);
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
          {(search || selectedCategoryFilter || selectedStatusFilter) && (
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

      {/* Brands Registry Table */}
      <div className="bg-white border border-light-border/60 rounded-3xl overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-light-border/40 flex justify-between items-center bg-slate-50/20">
          <h2 className="text-xs font-extrabold text-dark-navy uppercase tracking-widest">All Brands</h2>
          <span className="text-xs font-bold text-muted-gray">
            Showing {filteredBrands.length} of {brands.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8 mb-4" />
            <p className="text-xs font-bold text-muted-gray animate-pulse">Fetching brands...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-12 h-12 text-muted-gray/50 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-dark-navy uppercase tracking-widest">No Brands Found</h3>
            <p className="text-xs font-semibold text-muted-gray mt-1">Try resetting filters or adjusting search keys.</p>
            {(search || selectedCategoryFilter || selectedStatusFilter) && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 border border-light-border hover:bg-slate-50 text-dark-navy text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-slate-50/40">
            {groupedBrands.map((group) => {
              const catId = group.categoryId;
              const isExpanded = !!expandedCategories[catId];
              
              return (
                <div key={catId} className="border border-light-border/60 bg-white rounded-2xl shadow-2xs overflow-hidden transition-all duration-300">
                  {/* Accordion Group Header */}
                  <div
                    onClick={() => toggleCategoryExpand(catId)}
                    className="flex items-center justify-between px-6 py-4 bg-slate-50/40 hover:bg-slate-50/65 cursor-pointer transition-colors duration-200 border-b border-light-border/40 select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-dark-navy text-sm">
                        {group.categoryName}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-primary/5 text-primary border border-primary/10 uppercase tracking-wider">
                        {group.brands.length} {group.brands.length === 1 ? "Brand" : "Brands"}
                      </span>
                    </div>
                    <div className="text-muted-gray hover:text-dark-navy transition-colors duration-200">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Group Brands Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      {group.brands.length === 0 ? (
                        <div className="py-8 text-center text-muted-gray text-xs font-semibold">
                          No brands in this category.
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/65 text-muted-gray border-b border-light-border/40 text-[10px] font-extrabold uppercase tracking-widest">
                              <th className="py-3 px-6">Brand Name</th>
                              <th className="py-3 px-6 text-center w-[120px]">Status</th>
                              <th className="py-3 px-6 text-center w-[180px]">Actions</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-light-border/40 text-sm font-semibold text-dark-navy">
                            {group.brands.map((brand) => {
                              const isEditing = editingId === brand._id;

                              if (isEditing) {
                                return (
                                  <tr
                                    key={brand._id}
                                    className="bg-slate-50/40 border-y border-light-border/60 transition-all duration-300 animate-fadeIn"
                                  >
                                    <td colSpan={3} className="py-5 px-6 text-left">
                                      <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-primary uppercase tracking-widest">
                                          <Edit3 size={14} />
                                          <span>Editing Brand: <span className="text-dark-navy underline decoration-primary/45">{brand.name}</span></span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Brand Name</label>
                                            <div className="relative">
                                              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                                                <Layers size={14} />
                                              </span>
                                              <input
                                                type="text"
                                                value={editBrandName}
                                                onChange={(e) => setEditBrandName(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 border border-light-border rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy transition-all duration-300 bg-white"
                                                placeholder="Enter Brand Name"
                                              />
                                            </div>
                                          </div>

                                          <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-extrabold text-muted-gray uppercase tracking-widest">Category Type</label>
                                            <div className="relative">
                                              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
                                                <Tag size={14} />
                                              </span>
                                              <select
                                                value={editCategoryId}
                                                onChange={(e) => setEditCategoryId(e.target.value)}
                                                className="w-full pl-9 pr-8 py-2 rounded-xl border border-light-border bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-xs font-semibold text-dark-navy appearance-none cursor-pointer"
                                              >
                                                <option value="">Select Category</option>
                                                {categories.map((category) => (
                                                  <option key={category._id} value={category._id}>
                                                    {category.name}
                                                  </option>
                                                ))}
                                              </select>
                                              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-gray pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-border/40 mt-1">
                                          <button
                                            onClick={() => {
                                              setEditingId(null);
                                              setEditBrandName("");
                                              setEditCategoryId("");
                                            }}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-dark-navy text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                                          >
                                            <X size={14} />
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => handleUpdateInline(brand._id)}
                                            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
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
                                <tr key={brand._id} className="hover:bg-slate-50/30 transition-all duration-200">
                                  <td className="py-3.5 px-6">
                                    <span className="font-semibold text-dark-navy text-sm">{brand.name}</span>
                                  </td>

                                  <td className="py-3.5 px-6">
                                    <div className="flex items-center justify-center gap-2.5">
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={brand.isActive ?? true}
                                          onChange={() => handleToggleStatus(brand._id)}
                                          className="sr-only peer"
                                        />
                                        <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[14px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
                                      </label>
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                                          brand.isActive ?? true
                                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                        }`}
                                      >
                                        {(brand.isActive ?? true) ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-6">
                                    <div className="flex justify-center gap-2">
                                      <button
                                        onClick={() => handleEdit(brand)}
                                        className="p-1.5 text-muted-gray hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                        title="Edit Brand"
                                      >
                                        <Edit3 size={15} />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(brand._id)}
                                        className="p-1.5 text-muted-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
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
