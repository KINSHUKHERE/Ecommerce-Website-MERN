import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
  Plus,
  RotateCcw,
  Loader2,
  AlertTriangle,
  X,
  Check,
  Inbox,
} from "lucide-react";
import { getProduct, deleteProduct } from "../../api/ProductApi";
import { getCategories, getBrands } from "../../api/CategoryAndBrandApi";
import ProductStats from "../components/ProductStats";

// Custom Soft UI Dropdown Select Component
const SoftDropdown = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-light-border rounded-xl px-3.5 bg-slate-50/70 text-muted-gray hover:bg-slate-100/30 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-300 cursor-pointer text-xs font-extrabold uppercase tracking-wider h-[38px]"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-muted-gray transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 z-20 mt-1.5 max-h-56 overflow-y-auto bg-white border border-light-border rounded-2xl shadow-xl py-1.5 animate-slideDown">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer block uppercase tracking-wider ${
                  opt.value === value
                    ? "bg-primary/5 text-primary"
                    : "text-muted-gray hover:bg-slate-50 hover:text-dark-navy"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const AdminProducts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination states
  const [visibleCount, setVisibleCount] = useState(20);

  // Filters & Search states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Check navigation state for redirects (e.g., successful creations/deletions)
  useEffect(() => {
    if (location.state?.message) {
      showToast(location.state.message, location.state.type || "success");
      // Clean history state so toast doesn't re-trigger on reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch initial data
  const loadAllData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const isVendor = user.role === "vendor";
      const vendorId = isVendor ? user._id : null;

      const [productRes, categoryRes, brandRes] = await Promise.all([
        getProduct(vendorId),
        getCategories(),
        getBrands(),
      ]);
      setProducts(productRes.data.data || []);
      setCategories(categoryRes.data.categories || []);
      setBrands(brandRes.data.brands || []);
    } catch (err) {
      showToast("Failed to load store data", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Show customized toast helper
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Reset pagination when search/filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [search, selectedCategory, selectedBrand, selectedStatus, sortBy]);

  // Status helper
  const getProductTotalStock = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    }
    return product.quantity ?? 0;
  };

  const getProductPriceDisplay = (product) => {
    if (!product.variants || product.variants.length === 0) {
      return product.price ? `₹${product.price.toLocaleString()}` : "N/A";
    }
    const prices = product.variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }).format(minPrice);
    }
    const minFmt = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(minPrice);
    const maxFmt = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(maxPrice);
    return `${minFmt} - ${maxFmt}`;
  };

  const getProductStatus = (item) => {
    const qty = getProductTotalStock(item);
    if (qty <= 0 || item.sold) return "Sold";
    if (qty <= 3) return "Low Stock";
    return "In Stock";
  };

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.heading?.toLowerCase().includes(query) ||
          p.categoryId?.name?.toLowerCase().includes(query) ||
          p.brandId?.name?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(
        (p) => (p.categoryId?._id || p.categoryId) === selectedCategory
      );
    }

    // Brand filter
    if (selectedBrand) {
      result = result.filter(
        (p) => (p.brandId?._id || p.brandId) === selectedBrand
      );
    }

    // Status filter
    if (selectedStatus) {
      result = result.filter((p) => {
        const status = getProductStatus(p);
        if (selectedStatus === "Active") {
          return status !== "Sold";
        }
        return status === selectedStatus;
      });
    }

    // Sorting
    if (sortBy === "latest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "price-low") {
      result.sort((a, b) => {
        const pA = a.variants && a.variants.length > 0 ? Math.min(...a.variants.map(v => v.price)) : (a.price || 0);
        const pB = b.variants && b.variants.length > 0 ? Math.min(...b.variants.map(v => v.price)) : (b.price || 0);
        return pA - pB;
      });
    } else if (sortBy === "price-high") {
      result.sort((a, b) => {
        const pA = a.variants && a.variants.length > 0 ? Math.min(...a.variants.map(v => v.price)) : (a.price || 0);
        const pB = b.variants && b.variants.length > 0 ? Math.min(...b.variants.map(v => v.price)) : (b.price || 0);
        return pB - pA;
      });
    } else if (sortBy === "stock-low") {
      result.sort((a, b) => getProductTotalStock(a) - getProductTotalStock(b));
    } else if (sortBy === "stock-high") {
      result.sort((a, b) => getProductTotalStock(b) - getProductTotalStock(a));
    }

    return result;
  }, [products, search, selectedCategory, selectedBrand, selectedStatus, sortBy]);

  // Paginated slice
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Memoized options for custom dropdown filters
  const categoryOptions = useMemo(() => {
    return [
      { label: "All Categories", value: "" },
      ...categories.map((c) => ({ label: c.name, value: c._id }))
    ];
  }, [categories]);

  const brandOptions = useMemo(() => {
    const filtered = brands.filter(
      (v) =>
        !selectedCategory ||
        (v.categoryId?._id || v.categoryId) === selectedCategory
    );
    return [
      { label: "All Brands", value: "" },
      ...filtered.map((v) => ({ label: v.name, value: v._id }))
    ];
  }, [brands, selectedCategory]);

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Active Products", value: "Active" },
    { label: "In Stock Only", value: "In Stock" },
    { label: "Low Stock Only", value: "Low Stock" },
    { label: "Out of Stock / Sold", value: "Sold" }
  ];

  const sortOptions = [
    { label: "Sort by: Latest", value: "latest" },
    { label: "Sort by: Oldest", value: "oldest" },
    { label: "Price: Low to High", value: "price-low" },
    { label: "Price: High to Low", value: "price-high" },
    { label: "Stock: Low to High", value: "stock-low" },
    { label: "Stock: High to Low", value: "stock-high" }
  ];

  // Handle Delete API Call
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget._id;
    setDeletingId(targetId);
    setDeleteTarget(null); // Close modal

    try {
      await deleteProduct(targetId);
      showToast("Product deleted successfully", "success");
      setProducts((prev) => prev.filter((p) => p._id !== targetId));
    } catch (err) {
      showToast("Failed to delete product", "error");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedStatus("");
    setSortBy("latest");
    showToast("Filters reset successfully", "success");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 bg-soft-bg/30">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-xs font-semibold text-muted-gray animate-pulse">
          Fetching store catalog details...
        </p>
      </div>
    );
  }

  return (
    <div className="relative text-dark-navy antialiased">
      {/* Toast Alert Widget */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 bg-dark-navy border border-light-border/10 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              toast.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {toast.type === "success" ? <Check size={12} /> : <X size={12} />}
          </div>
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-navy tracking-tight leading-normal">
            All Products
          </h1>
          <p className="text-xs sm:text-sm text-muted-gray mt-1.5 font-medium leading-relaxed">
            Manage and view all your store products.
          </p>
        </div>
        <Link
          to="/create-product"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer h-[38px] active:scale-95"
        >
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      {/* Top Stat Cards Section */}
      <ProductStats
        products={products}
        activeFilter={selectedStatus}
        onCardClick={setSelectedStatus}
      />

      {/* Search & Filters Block */}
      <div className="bg-white border border-light-border/60 rounded-3xl p-5 mb-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Row */}
          <div className="relative flex-1 min-w-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-gray pointer-events-none">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by product name, category, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-50/70 border border-light-border rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-semibold text-dark-navy transition-all duration-300 h-[38px]"
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

          {/* Filters Selectors Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <SoftDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              placeholder="Category"
            />

            {/* Brand Filter */}
            <SoftDropdown
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={brandOptions}
              placeholder="Brand"
            />

            {/* Stock Status Filter */}
            <SoftDropdown
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              placeholder="Status"
            />

            {/* Sort Filter */}
            <SoftDropdown
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              placeholder="Sort by"
            />

            {/* Reset Button */}
            {(search || selectedCategory || selectedBrand || selectedStatus || sortBy !== "latest") && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center justify-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50/50 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer h-[38px]"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product List Content */}
      {visibleProducts.length === 0 ? (
        <div className="bg-white border border-light-border/60 rounded-3xl p-12 text-center shadow-2xs">
          <Inbox className="w-12 h-12 text-muted-gray/50 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-base font-extrabold text-dark-navy">No Products Found</h3>
          <p className="text-xs text-muted-gray mt-1.5 max-w-sm mx-auto font-semibold leading-relaxed">
            Try adjusting your search keys, resetting filters, or adding a new product.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-5 inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-50 border border-light-border hover:bg-slate-100 text-muted-gray hover:text-dark-navy text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-light-border/60 rounded-3xl overflow-hidden shadow-2xs text-left">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-soft-bg/80 text-muted-gray border-b border-light-border/40 text-xs font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-6 w-20">Image</th>
                    <th className="py-3.5 px-6 min-w-[200px]">Product</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Brand</th>
                    <th className="py-3.5 px-6 text-right">Price</th>
                    <th className="py-3.5 px-6 text-center">Stock</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border/20 text-sm font-semibold text-dark-navy">
                  {visibleProducts.map((p) => {
                    const status = getProductStatus(p);
                    const isSold = status === "Sold";
                    const priceDisplay = getProductPriceDisplay(p);

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/20 transition-all">
                        <td className="py-3.5 px-6">
                          <img
                            src={p.imgUrl}
                            alt={p.heading}
                            className={`w-10 h-10 object-contain rounded-xl border border-light-border/30 bg-white ${
                              isSold ? "grayscale opacity-50" : ""
                            }`}
                          />
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="block font-bold text-dark-navy truncate max-w-[240px]">
                            {p.heading}
                          </span>
                          <span className="text-[10px] text-muted-gray font-mono font-normal">
                            ID: {p._id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-xs text-muted-gray">
                          {p.categoryId?.name || "N/A"}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-muted-gray">
                          {p.brandId?.name || "N/A"}
                        </td>
                        <td className="py-3.5 px-6 text-right font-extrabold text-dark-navy">
                          {priceDisplay}
                        </td>
                        <td className="py-3.5 px-6 text-center font-extrabold text-dark-navy">
                          {getProductTotalStock(p)}
                        </td>
                        <td className="py-3.5 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                              status === "In Stock"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : status === "Low Stock"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-red-50 text-red-655 border border-red-100"
                            }`}
                          >
                            {isSold ? "Sold" : status}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center justify-center gap-1">
                            <Link
                              to={`/admin/products/${p._id}`}
                              className="p-1.5 text-muted-gray hover:text-primary hover:bg-primary/5 rounded-lg transition cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={15} />
                            </Link>
                            <Link
                              to={`/admin/products/edit/${p._id}`}
                              className="p-1.5 text-muted-gray hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Edit Details"
                            >
                              <Pencil size={15} />
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              disabled={deletingId === p._id}
                              className="p-1.5 text-muted-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                              title="Delete Product"
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
          </div>

          {/* Mobile Card List View (1-column cards) */}
          <div className="block md:hidden space-y-4 text-left">
            {visibleProducts.map((p) => {
              const status = getProductStatus(p);
              const isSold = status === "Sold";
              const priceDisplay = getProductPriceDisplay(p);

              return (
                <div
                  key={p._id}
                  className="bg-white border border-light-border/60 rounded-3xl p-4.5 shadow-2xs flex flex-col gap-3.5 relative overflow-hidden"
                >
                  {/* Status Badge in Top Right */}
                  <span
                    className={`absolute top-4.5 right-4.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                      status === "In Stock"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : status === "Low Stock"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-red-50 text-red-655 border border-red-100"
                    }`}
                  >
                    {isSold ? "Sold" : status}
                  </span>

                  <div className="flex gap-4">
                    {/* Left: Product Image */}
                    <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-soft-bg border border-light-border/30 rounded-xl p-1.5">
                      <img
                        src={p.imgUrl}
                        alt={p.heading}
                        className={`w-full h-full object-contain rounded-lg ${
                          isSold ? "grayscale opacity-50" : ""
                        }`}
                      />
                    </div>

                    {/* Right: Product Basic Details */}
                    <div className="flex-1 min-w-0 pr-20">
                      <span className="block text-[10px] font-extrabold text-muted-gray uppercase tracking-widest leading-none">
                        {p.brandId?.name || "No Brand"}
                      </span>
                      <h3 className="font-bold text-sm text-dark-navy mt-1.5 leading-snug truncate">
                        {p.heading}
                      </h3>
                      <div className="flex items-baseline gap-2.5 mt-2">
                        <span className="text-sm font-black text-primary">
                          {priceDisplay}
                        </span>
                        <span className="text-xs font-semibold text-muted-gray">
                          Stock: {getProductTotalStock(p)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-light-border/40 mt-1">
                    <span className="text-[10px] font-semibold text-muted-gray font-mono">
                      ID: {p._id.slice(-6).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/admin/products/${p._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-muted-gray hover:text-primary hover:bg-primary/5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <Eye size={13} />
                        View
                      </Link>
                      <Link
                        to={`/admin/products/edit/${p._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-muted-gray hover:text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <Pencil size={13} />
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-red-500 hover:text-red-700 hover:bg-red-55/40 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simple Load More Controls */}
          <div className="flex flex-col items-center justify-center py-4 border-t border-light-border/40 mt-4">
            <p className="text-xs text-muted-gray font-semibold mb-3">
              Showing 1 to {Math.min(visibleCount, filteredProducts.length)} of{" "}
              {filteredProducts.length} products
            </p>
            {visibleCount < filteredProducts.length && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className="px-6 py-2 border border-light-border hover:border-primary hover:text-primary rounded-xl text-xs font-bold uppercase tracking-wider text-muted-gray transition bg-white shadow-2xs cursor-pointer h-[38px] active:scale-95"
              >
                Load More Products
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-light-border rounded-3xl max-w-sm w-full p-6 shadow-2xl z-10 relative overflow-hidden animate-scaleUp text-left">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-dark-navy text-sm">Delete Product</h3>
                <p className="text-xs text-muted-gray mt-1.5 leading-relaxed font-semibold">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
                <p className="text-xs text-dark-navy font-bold mt-3.5 truncate bg-soft-bg p-2.5 rounded-xl border border-light-border/60">
                  {deleteTarget.heading}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-light-border text-muted-gray hover:bg-slate-50 text-xs font-bold rounded-xl transition cursor-pointer h-[38px]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer h-[38px] active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
