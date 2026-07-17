import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  AlertTriangle,
  Loader2,
  Clock,
  Layers,
  Tag,
  Box,
  IndianRupee,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getProduct, deleteProduct } from "../../api/ProductApi";

const ProductView = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
const [touchStartX, setTouchStartX] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const selectedVariant = (selectedVariantIndex !== null && product?.variants?.[selectedVariantIndex]) || null;
  const allImages = product
    ? Array.from(
        new Set([
          ...(selectedVariant && selectedVariant.images && selectedVariant.images.length > 0 ? selectedVariant.images : []),
          product.imgUrl,
          ...(product.images || [])
        ])
      ).filter(Boolean)
    : [];

  const nextSlide = () => {
    setActiveImgIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveImgIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const threshold = 50; // minimum swipe distance
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  // Check navigation state for redirects (e.g. successful updates)
  useEffect(() => {
    if (location.state?.message) {
      showToast(location.state.message, location.state.type || "success");
      // Clean history state so toast doesn't re-trigger on reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchProductDetails = async () => {
    try {
      const response = await getProduct(null, true);
      const found = response.data.data.find((p) => p._id === productId);
      if (found) {
        setProduct(found);
      } else {
        showToast("Product not found", "error");
        setTimeout(() => navigate("/admin/products"), 1500);
      }
    } catch (err) {
      showToast("Error retrieving product details", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    if (product) {
      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const isVendorUser = currentUser.role === "vendor";
      document.title = `YoCart | ${isVendorUser ? "Seller" : "Admin"} - View ${product.heading || "Product"}`;
    }
  }, [product]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleConfirmDelete = async () => {
    if (!product) return;
    setDeleting(true);
    setIsDeleteModalOpen(false);

    try {
      await deleteProduct(product._id);
      // Navigate to product list page with success toast state
      navigate("/admin/products", {
        state: { message: "Product deleted successfully", type: "success" },
      });
    } catch (err) {
      showToast("Failed to delete product", "error");
      console.error(err);
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProductTotalStock = (p) => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    }
    return p.quantity ?? 0;
  };

  const getProductPriceDisplay = (p) => {
    if (!p.variants || p.variants.length === 0) {
      return p.price ? `₹${p.price.toLocaleString()}` : "N/A";
    }
    const prices = p.variants.map(v => v.price);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <Loader2 className="animate-spin text-[#088178] w-8 h-8 mb-4" />
        <p className="text-sm font-semibold text-gray-505 animate-pulse">
          Loading product record details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white border border-gray-150 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
        <p className="text-sm font-bold text-gray-800">Product not found</p>
        <Link
          to="/admin/products"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-250 text-gray-700 text-xs font-bold rounded-lg transition"
        >
          <ArrowLeft size={14} />
          Back to Product Registry
        </Link>
      </div>
    );
  }

  const status = getProductStatus(product);
  const priceDisplay = getProductPriceDisplay(product);

  return (
    <div className="max-w-4xl mx-auto">
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
          <span className="text-sm font-bold text-gray-800">
            {toast.message}
          </span>
        </div>
      )}

      {/* Top Navigation / Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Products
        </Link>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to={`/admin/products/edit/${product._id}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/10 hover:shadow-lg hover:shadow-blue-600/15 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Pencil size={14} />
            Edit Products
          </Link>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={deleting}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-705 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/10 hover:shadow-lg hover:shadow-red-600/15 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={14} />
            Delete Product
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm shadow-slate-100/40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Image Area */}
          <div className="md:col-span-5 flex flex-col items-center w-full">
            <div className="w-full aspect-square max-w-[280px] bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden group shadow-sm" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <img
                src={allImages[activeImgIndex]}
                alt={product.heading}
                className={`w-full h-full object-contain rounded-xl transition-all duration-300 transform scale-100 hover:scale-105 ${
                  status === "Sold" ? "grayscale opacity-50" : ""
                }`}
              />
              
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[#088178] hover:text-white text-gray-800 p-1.5 rounded-full shadow transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer border border-slate-100"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-[#088178] hover:text-white text-gray-800 p-1.5 rounded-full shadow transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer border border-slate-100"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails (Flipkart style below main) */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-1.5 max-w-[280px] scrollbar-none justify-center w-full mt-3">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onMouseEnter={() => setActiveImgIndex(idx)}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`relative w-12 h-12 flex-shrink-0 bg-white border rounded-lg overflow-hidden p-1 transition-all duration-200 cursor-pointer ${
                      activeImgIndex === idx
                        ? "border-[#088178] ring-2 ring-[#088178]/20"
                        : "border-gray-200 hover:border-[#088178]/40"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-contain rounded"
                    />
                  </button>
                ))}
              </div>
            )}

            {selectedVariantIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setSelectedVariantIndex(null);
                  setActiveImgIndex(0);
                }}
                className="mt-2.5 text-[10px] font-extrabold text-[#088178] hover:underline cursor-pointer flex items-center gap-1 bg-[#088178]/5 px-2.5 py-1.5 rounded-lg border border-[#088178]/10 w-full justify-center max-w-[280px]"
              >
                ← Reset to All Product Images
              </button>
            )}

            <div className="mt-4.5 w-full bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 flex flex-col gap-2.5 max-w-[280px]">
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> Created:
                </span>
                <span className="text-gray-800">
                  {formatDate(product.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold border-t border-slate-100 pt-2.5">
                <span className="flex items-center gap-1">
                  <Clock size={13} /> Updated:
                </span>
                <span className="text-gray-800">
                  {formatDate(product.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Attribute Details */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              {/* Category, Brand, Status Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#088178]/5 border border-[#088178]/10 text-[#088178] rounded-md text-[10px] font-bold">
                  <Tag size={11} />
                  {product.categoryId?.name || "No Category"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-750 rounded-md text-[10px] font-bold">
                  <Layers size={11} />
                  {product.brandId?.name || "No Brand"}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold ${
                    status === "In Stock"
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : status === "Low Stock"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-zinc-150 text-zinc-650 border border-zinc-200"
                  }`}
                >
                  {status === "Sold" ? "Sold / Out of Stock" : status}
                </span>
              </div>

              {/* Title heading */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                {product.heading}
              </h2>

              <p className="text-[10px] text-gray-400 font-mono">
                Product Database ID: {product._id}
              </p>

              {/* Price & Quantity Grid */}
              <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-4 my-2.5 bg-slate-50/50 rounded-xl px-4">
                <div>
                  <span className="block text-[10px] text-gray-450 uppercase font-bold tracking-wider">
                    Price Range / Price
                  </span>
                  <span className="text-xl font-extrabold text-[#088178] mt-1 block leading-none">
                    {priceDisplay}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-455 uppercase font-bold tracking-wider">
                    Total Quantity In Stock
                  </span>
                  <span className="text-xl font-extrabold text-gray-900 mt-1 block leading-none">
                    {getProductTotalStock(product)} units
                  </span>
                </div>
              </div>

              {/* Description Body */}
              <div className="order-2 md:order-none">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Product Description
                </h4>
                <p className="text-xs text-gray-655 leading-relaxed font-medium bg-gray-50 border border-gray-100 p-3.5 rounded-xl whitespace-pre-line">
                  {product.description || "No description provided."}
                </p>
              </div>

              {/* Variants Details Table */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-4 md:mt-6 border-t pt-4 md:pt-6 text-left order-1 md:order-none">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Configured Product Variants ({product.variants.length})
                  </h4>
                  <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-slate-100">
                          <th className="py-2.5 px-4 w-12 text-center">Image</th>
                          <th className="py-2.5 px-4">Variant Attributes</th>
                          <th className="py-2.5 px-4 text-right">Price</th>
                          <th className="py-2.5 px-4 text-center">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {product.variants.map((v, vIdx) => {
                          const name = v.attributes.length > 0
                            ? v.attributes.map(a => a.value).join(" • ")
                            : "Default Base Variant";
                          return (
                            <tr
                              key={vIdx}
                              onClick={() => {
                                setSelectedVariantIndex(prev => prev === vIdx ? null : vIdx);
                                setActiveImgIndex(0);
                              }}
                              className={`cursor-pointer transition-all ${
                                selectedVariantIndex === vIdx
                                  ? "bg-[#088178]/5 font-bold text-[#088178] border-l-2 border-[#088178]"
                                  : "hover:bg-slate-50/20"
                              }`}
                            >
                              <td className="py-2.5 px-4 text-center">
                                <div className="w-8 h-8 rounded border bg-slate-50 flex items-center justify-center overflow-hidden">
                                  {v.images && v.images.length > 0 ? (
                                    <img src={v.images[0]} alt="Variant" className="w-full h-full object-contain" />
                                  ) : (
                                    <Box size={14} className="text-gray-400" />
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-4 font-bold text-slate-800">{name}</td>
                              <td className="py-2.5 px-4 text-right text-[#088178]">
                                ₹{v.price.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-4 text-center">{v.quantity}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="bg-white border border-gray-150 rounded-2xl max-w-sm w-full p-6 shadow-2xl z-10 relative overflow-hidden animate-slideUp">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-55 flex items-center justify-center text-red-600 flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm">
                  Delete Product
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-semibold">
                  Are you sure you want to delete this product? This action is
                  permanent and cannot be undone.
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-2 truncate bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {product.heading}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
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

export default ProductView;
