import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
  Plus,
  ArrowUpDown,
  RotateCcw,
  Loader2,
  AlertTriangle,
  X,
  Check,
  Briefcase,
  Layers,
  Inbox,
  TrendingUp,
  Package
} from "lucide-react";
import { getProduct, deleteProduct } from "../../api/ProductApi";
import { getCategories, getVariants } from "../../api/CategoryAndVarientApi";
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
        className="w-full flex items-center justify-between border border-slate-100 rounded-xl px-3.5 bg-slate-50/70 text-slate-600 hover:bg-slate-100/30 focus:bg-white focus:outline-none focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 transition-all duration-300 cursor-pointer text-xs font-semibold text-left h-[38px]"
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
          className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 z-20 mt-1.5 max-h-56 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl py-1 animate-slideDown">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer block ${
                  opt.value === value
                    ? "bg-[#088178]/5 text-[#088178]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
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
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination states
  const [visibleCount, setVisibleCount] = useState(20);

  // Filters & Search states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
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
      const [productRes, categoryRes, variantRes] = await Promise.all([
        getProduct(),
        getCategories(),
        getVariants(),
      ]);
      setProducts(productRes.data.data || []);
      setCategories(categoryRes.data.categories || []);
      setVariants(variantRes.data.variants || []);
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
  }, [search, selectedCategory, selectedVariant, selectedStatus, sortBy]);

  // Status helper
  const getProductStatus = (item) => {
    const qty = item.quantity ?? 10;
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
          p.variantId?.name?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(
        (p) => (p.categoryId?._id || p.categoryId) === selectedCategory
      );
    }

    // Variant filter
    if (selectedVariant) {
      result = result.filter(
        (p) => (p.variantId?._id || p.variantId) === selectedVariant
      );
    }

    // Status filter
    if (selectedStatus) {
      result = result.filter((p) => {
        const status = getProductStatus(p);
        return status === selectedStatus;
      });
    }

    // Sorting
    if (sortBy === "latest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "stock-low") {
      result.sort((a, b) => (a.quantity ?? 10) - (b.quantity ?? 10));
    } else if (sortBy === "stock-high") {
      result.sort((a, b) => (b.quantity ?? 10) - (a.quantity ?? 10));
    }

    return result;
  }, [products, search, selectedCategory, selectedVariant, selectedStatus, sortBy]);

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
    const filtered = variants.filter(
      (v) =>
        !selectedCategory ||
        (v.categoryId?._id || v.categoryId) === selectedCategory
    );
    return [
      { label: "All Brands", value: "" },
      ...filtered.map((v) => ({ label: v.name, value: v._id }))
    ];
  }, [variants, selectedCategory]);

  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "In Stock", value: "In Stock" },
    { label: "Low Stock", value: "Low Stock" },
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
    setSelectedVariant("");
    setSelectedStatus("");
    setSortBy("latest");
    showToast("Filters reset successfully", "success");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="animate-spin text-[#088178] w-10 h-10 mb-4" />
        <p className="text-sm font-semibold text-gray-500 animate-pulse">
          Fetching store catalog details...
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast Alert Widget */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl bg-white border border-gray-150 shadow-xl animate-slideIn">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toast.type === "success"
                ? "bg-green-50 text-green-600 border border-green-100"
                : "bg-red-50 text-red-650 border border-red-100"
            }`}
          >
            {toast.type === "success" ? <Check size={14} /> : <X size={14} />}
          </div>
          <span className="text-sm font-bold text-gray-800">{toast.message}</span>
        </div>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">
            All Products
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Manage and view all your store products.
          </p>
        </div>
        <Link
          to="/create-product"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-[#15877F] to-[#088178] hover:from-[#15877F]/95 hover:to-[#088178]/95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#088178]/10 hover:shadow-lg hover:shadow-[#088178]/15 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
        >
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      {/* Top Stat Cards Section */}
      <ProductStats products={products} />

      {/* Search & Filters Block */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm shadow-slate-100/30">
        <div className="flex flex-col gap-4">
          {/* Search Row */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by product name, category, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 border border-slate-100 rounded-xl focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-sm font-medium transition-all duration-300"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-655 transition"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filters Selectors Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Category Filter */}
            <SoftDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              placeholder="All Categories"
            />

            {/* Brand Filter */}
            <SoftDropdown
              value={selectedVariant}
              onChange={setSelectedVariant}
              options={brandOptions}
              placeholder="All Brands"
            />

            {/* Stock Status Filter */}
            <SoftDropdown
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              placeholder="All Statuses"
            />

            {/* Sort Filter */}
            <SoftDropdown
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              placeholder="Sort by: Latest"
            />

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="col-span-2 md:col-span-1 inline-flex items-center justify-center gap-1.5 border border-red-100 text-red-500 hover:bg-red-50/50 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer h-[38px]"
            >
              <RotateCcw size={12} />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Product List Content */}
      {visibleProducts.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm shadow-slate-100/30">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Products Found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto font-medium">
            Try adjusting your search keys, resetting filters, or adding a new product.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-gray-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm shadow-slate-100/30">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/65 text-gray-500 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-4 w-16">Image</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Brand</th>
                    <th className="py-3.5 px-4 text-right">Price</th>
                    <th className="py-3.5 px-4 text-center">Stock</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                  {visibleProducts.map((p) => {
                    const status = getProductStatus(p);
                    const isSold = status === "Sold";
                    const formattedPrice = new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0
                    }).format(p.price);

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4">
                          <img
                            src={p.imgUrl}
                            alt={p.heading}
                            className={`w-10 h-10 object-contain rounded-md border border-gray-100 bg-white ${
                              isSold ? "grayscale opacity-50" : ""
                            }`}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className="block font-bold text-slate-800 truncate max-w-[240px]">
                            {p.heading}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {p._id}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {p.categoryId?.name || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {p.variantId?.name || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                          {formattedPrice}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {p.quantity ?? 10}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              status === "In Stock"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : status === "Low Stock"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-zinc-150 text-zinc-650 border border-zinc-200"
                            }`}
                          >
                            {isSold ? "Sold" : status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link
                              to={`/admin/products/${p._id}`}
                              className="p-1.5 text-gray-500 hover:text-[#088178] hover:bg-[#088178]/5 rounded transition cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={15} />
                            </Link>
                            <Link
                              to={`/admin/products/edit/${p._id}`}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                              title="Edit Details"
                            >
                              <Pencil size={15} />
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              disabled={deletingId === p._id}
                              className="p-1.5 text-gray-500 hover:text-red-650 hover:bg-red-50 rounded transition cursor-pointer disabled:opacity-50"
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
          <div className="block md:hidden space-y-4">
            {visibleProducts.map((p) => {
              const status = getProductStatus(p);
              const isSold = status === "Sold";
              const formattedPrice = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
              }).format(p.price);

              return (
                <div
                  key={p._id}
                  className="bg-white border border-gray-150 rounded-xl p-4.5 shadow-sm flex flex-col gap-3 relative overflow-hidden"
                >
                  {/* Status Badge in Top Right */}
                  <span
                    className={`absolute top-4.5 right-4.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      status === "In Stock"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : status === "Low Stock"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-zinc-150 text-zinc-650 border border-zinc-200"
                    }`}
                  >
                    {isSold ? "Sold" : status}
                  </span>

                  <div className="flex gap-4.5">
                    {/* Left: Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-lg p-1.5">
                      <img
                        src={p.imgUrl}
                        alt={p.heading}
                        className={`w-full h-full object-contain rounded ${
                          isSold ? "grayscale opacity-50" : ""
                        }`}
                      />
                    </div>

                    {/* Right: Product Basic Details */}
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">
                        {p.variantId?.name || "No Brand"}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-800 mt-1 leading-snug truncate">
                        {p.heading}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-sm font-extrabold text-[#088178]">
                          {formattedPrice}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          Stock: {p.quantity ?? 10}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium mt-1 leading-normal line-clamp-1">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-1">
                    <span className="text-[10px] text-gray-400 font-mono">
                      ID: {p._id.slice(-6).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/admin/products/${p._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-700 hover:text-[#088178] hover:bg-[#088178]/5 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        <Eye size={13} />
                        View
                      </Link>
                      <Link
                        to={`/admin/products/edit/${p._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        <Pencil size={13} />
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-red-500 hover:text-red-750 hover:bg-red-50 rounded-lg text-xs font-bold transition cursor-pointer"
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
          <div className="flex flex-col items-center justify-center py-4 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 font-semibold mb-3">
              Showing 1 to {Math.min(visibleCount, filteredProducts.length)} of{" "}
              {filteredProducts.length} products
            </p>
            {visibleCount < filteredProducts.length && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className="px-6 py-2 border border-gray-200 hover:border-[#088178] hover:text-[#088178] rounded-xl text-xs font-bold text-gray-600 transition bg-white shadow-sm cursor-pointer"
              >
                Load More Products
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl z-10 relative overflow-hidden animate-slideUp">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-650 flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Delete Product</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Are you sure you want to delete this product?
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-2 truncate bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {deleteTarget.heading}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition cursor-pointer"
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
