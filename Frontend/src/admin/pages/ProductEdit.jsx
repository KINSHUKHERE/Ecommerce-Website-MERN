import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct, updateProduct, uploadProductImage } from "../../api/ProductApi";
import {
  getCategories,
  getVariantsByCategory,
} from "../../api/CategoryAndVarientApi";
import {
  Link as LinkIcon,
  Tag,
  Layers,
  Heading,
  IndianRupee,
  Box,
  AlignLeft,
  Sparkles,
  ArrowLeft,
  Loader2,
  X,
  Check,
  Image as ImageIcon,
  Upload,
  Trash2
} from "lucide-react";

const ProductEdit = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    categoryId: "",
    variantId: "",
    heading: "",
    price: "",
    quantity: "",
    description: "",
  });

  const [productImages, setProductImages] = useState([]); // Max 6 images
  const [imageInputMethod, setImageInputMethod] = useState("upload"); // "upload" | "url"
  const [urlInput, setUrlInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoryRes = await getCategories();
        setCategories(categoryRes.data.categories || []);

        const productRes = await getProduct();
        const product = productRes.data.data.find((p) => p._id === productId);

        if (product) {
          const categoryId = product.categoryId?._id || product.categoryId;
          setFormData({
            categoryId: categoryId || "",
            variantId: product.variantId?._id || product.variantId || "",
            heading: product.heading || "",
            price: product.price || "",
            quantity: product.quantity ?? 10,
            description: product.description || "",
          });

          const combined = [];
          if (product.imgUrl) combined.push(product.imgUrl);
          if (product.images && product.images.length > 0) {
            combined.push(...product.images);
          }
          setProductImages(combined);

          if (categoryId) {
            const variantRes = await getVariantsByCategory(categoryId);
            setVariants(variantRes.data.variants || []);
          }
        } else {
          showToast("Product not found", "error");
          setTimeout(() => navigate("/admin/products"), 1500);
        }
      } catch (err) {
        showToast("Error loading product record", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId, navigate]);

  useEffect(() => {
    if (formData.heading) {
      document.title = `YoCart | Admin - Edit ${formData.heading}`;
    }
  }, [formData.heading]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (productImages.length + files.length > 6) {
      showToast("You can add up to 6 images only.", "error");
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map((file) => uploadProductImage(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map((res) => res.data.url);
      setProductImages((prev) => [...prev, ...urls]);
      setImgLoadError(false);
    } catch (err) {
      console.error("Image upload failed:", err);
      showToast("Failed to upload one or more images", "error");
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    if (!urlInput.trim()) return;
    if (productImages.length >= 6) {
      showToast("You can add up to 6 images only.", "error");
      return;
    }
    setProductImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
    setImgLoadError(false);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reorderedImages = [...productImages];
    const [draggedItem] = reorderedImages.splice(draggedIndex, 1);
    reorderedImages.splice(index, 0, draggedItem);

    setProductImages(reorderedImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const removeImage = (indexToRemove) => {
    setProductImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      categoryId,
      variantId: "",
    }));
    setVariants([]);

    if (categoryId) {
      try {
        const response = await getVariantsByCategory(categoryId);
        setVariants(response.data.variants || []);
      } catch (err) {
        showToast("Error loading variants", "error");
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (productImages.length === 0) {
      showToast("Please upload or add at least one product image.", "error");
      return;
    }
    setSaving(true);

    const finalData = {
      ...formData,
      imgUrl: productImages[0],
      images: productImages.slice(1),
    };

    try {
      await updateProduct(productId, finalData);
      // Navigate to View page with success toast state
      navigate(`/admin/products/${productId}`, {
        state: { message: "Product details updated successfully", type: "success" }
      });
    } catch (err) {
      showToast("Failed to update product details", "error");
      console.error(err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12">
        <Loader2 className="animate-spin text-[#088178] w-8 h-8 mb-4" />
        <p className="text-sm font-semibold text-gray-505 animate-pulse">
          Loading product record editor...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Toast Alert Widget */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl bg-white border border-gray-150 shadow-xl animate-slideIn">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toast.type === "success"
                ? "bg-green-50 text-green-600 border border-green-100"
                : "bg-red-50 text-red-655 border border-red-100"
            }`}
          >
            {toast.type === "success" ? <Check size={14} /> : <X size={14} />}
          </div>
          <span className="text-sm font-bold text-gray-800">{toast.message}</span>
        </div>
      )}

      {/* Header back button */}
      <div className="mb-4">
        <Link
          to={`/admin/products/${productId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} />
          Cancel and Go Back
        </Link>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm shadow-slate-100/40">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#15877F] to-[#088178]"></div>

        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-gray-900 leading-tight">
            Edit Product details
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Modify the records of this product catalog.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Form Fields: 8 columns */}
            <div className="md:col-span-8 space-y-4">
              {/* Unified Product Images Manager */}
              <div className="space-y-4 border-b border-slate-100 pb-5">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider text-left">
                      Product Images ({productImages.length}/6)
                    </label>
                    <p className="text-[10px] text-gray-450 font-medium text-left">
                      The first image will automatically be set as the Primary Cover.
                    </p>
                  </div>
                  
                  {/* Single Mode Selector pills */}
                  {productImages.length < 6 && (
                    <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setImageInputMethod("upload")}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                          imageInputMethod === "upload"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMethod("url")}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                          imageInputMethod === "url"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-gray-555 hover:text-gray-800"
                        }`}
                      >
                        Image Link URL
                      </button>
                    </div>
                  )}
                </div>

                {/* Add Image Inputs (hidden if count is 6) */}
                {productImages.length < 6 ? (
                  imageInputMethod === "upload" ? (
                    <label className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-3 hover:border-[#088178] hover:bg-[#088178]/5 transition-all cursor-pointer">
                      {uploading ? (
                        <div className="flex flex-col items-center justify-center text-[#088178]">
                          <Loader2 className="animate-spin mb-1.5" size={20} />
                          <span className="text-[10px] font-semibold">Uploading to Cloudinary...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 text-center">
                          <Upload className="mb-1" size={20} />
                          <span className="text-[11px] font-bold text-gray-500">Upload Product Photos</span>
                          <span className="text-[9px] text-gray-400 mt-0.5">Select up to {6 - productImages.length} more file(s)</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                          <LinkIcon size={14} />
                        </span>
                        <input
                          type="text"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="Paste image link URL here..."
                          className="w-full pl-8.5 pr-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50/70 focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none transition-all text-xs font-semibold text-gray-755 placeholder-gray-400 h-[32px]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addImageUrl}
                        className="px-4 py-1 bg-[#088178] hover:bg-[#06635c] text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center h-[32px]"
                      >
                        Add URL
                      </button>
                    </div>
                  )
                ) : (
                  <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl text-center text-xs font-semibold text-teal-800">
                    Maximum photo limit of 6 reached. Delete existing ones to add different images.
                  </div>
                )}

                {/* Photos Preview Grid */}
                {productImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-start pt-1">
                    {productImages.map((url, index) => (
                      <div
                        key={index}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`relative aspect-square border rounded-xl bg-gray-50 flex items-center justify-center p-1.5 overflow-hidden shadow-sm group transition-all cursor-grab active:cursor-grabbing ${
                          index === 0 ? "border-[#088178]/40 ring-2 ring-[#088178]/5" : "border-slate-150"
                        } ${draggedIndex === index ? "opacity-40 border-[#088178] border-dashed" : ""}`}
                      >
                        <img
                          src={url}
                          alt={`Product Photo ${index + 1}`}
                          className="w-full h-full object-contain rounded-lg"
                        />
                        
                        {/* Primary Cover Badge */}
                        {index === 0 && (
                          <div className="absolute top-1 left-1.5 bg-[#088178] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                            PRIMARY
                          </div>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid for Category & Variant dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Select */}
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-gray-655 uppercase tracking-wider text-left">
                    Category Type
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                      <Tag size={15} />
                    </span>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleCategoryChange}
                      required
                      className="w-full pl-9.5 pr-8 py-2.5 rounded-xl border border-slate-100 bg-slate-50/70 focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none transition-all text-xs font-semibold text-gray-700 appearance-none cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-450 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </span>
                  </div>
                </div>

                {/* Variant Select */}
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-gray-655 uppercase tracking-wider text-left">
                    Brand / Variant
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                      <Layers size={15} />
                    </span>
                    <select
                      name="variantId"
                      value={formData.variantId}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.categoryId}
                      className="w-full pl-9.5 pr-8 py-2.5 rounded-xl border border-slate-100 bg-slate-50/70 focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none transition-all text-xs font-semibold text-gray-700 appearance-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select Variant</option>
                      {variants.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-450 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Title */}
              <InputField
                label="Product Title Name"
                name="heading"
                value={formData.heading}
                onChange={handleInputChange}
                placeholder="Sony Headphones"
                icon={Heading}
              />

              {/* Price & Quantity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Price Rate (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="29990"
                  icon={IndianRupee}
                />
                <InputField
                  label="Available Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="10"
                  icon={Box}
                />
              </div>
            </div>

            {/* Live Image Preview: 4 columns */}
            <div className="md:col-span-4 flex flex-col items-center justify-start border-l border-slate-100 pl-0 md:pl-6 pt-4 md:pt-0">
              <label className="block mb-2 text-xs font-bold text-gray-650 uppercase tracking-wider text-center w-full">
                Live Image Preview
              </label>
              <div className="w-full aspect-square max-w-[200px] border border-slate-100 rounded-2xl bg-slate-50/50 flex items-center justify-center p-3 overflow-hidden relative">
                {productImages[0] && !imgLoadError ? (
                  <img
                    src={productImages[0]}
                    alt="Preview"
                    onError={() => setImgLoadError(true)}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 text-center p-4">
                    <ImageIcon size={32} className="mb-2 text-gray-300" />
                    <span className="text-[10px] font-semibold leading-normal">
                      {imgLoadError ? "Broken/Invalid Image URL" : "No Image URL entered"}
                    </span>
                  </div>
                )}
              </div>
              {productImages[0] && !imgLoadError && (
                <span className="text-[9px] text-green-600 font-bold mt-2.5 flex items-center gap-1">
                  ✓ Image URL valid
                </span>
              )}
            </div>
          </div>

          {/* Description Block */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-655 uppercase tracking-wider text-left">
              Product Description Specs
            </label>
            <div className="relative">
              <span className="absolute top-2.5 left-3 text-gray-400 pointer-events-none">
                <AlignLeft size={15} />
              </span>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe product specifications..."
                className="w-full pl-9.5 pr-4 py-2 bg-slate-50/70 border border-slate-100 rounded-xl focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-xs font-semibold text-gray-750 resize-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Link
              to={`/admin/products/${productId}`}
              className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-gray-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#088178] hover:bg-[#06635c] text-white text-xs font-bold rounded-xl shadow-md shadow-[#088178]/10 hover:shadow-lg hover:shadow-[#088178]/15 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-3.5 h-3.5" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Save Product Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}) => (
  <div>
    <label className="block mb-1.5 text-xs font-bold text-gray-655 uppercase tracking-wider text-left">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
          <Icon size={15} />
        </span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className={`w-full ${
          Icon ? "pl-9" : "px-3"
        } pr-4 py-2 bg-slate-50/70 border border-slate-100 rounded-xl focus:bg-white focus:border-[#088178]/30 focus:ring-4 focus:ring-[#088178]/5 outline-none text-xs font-semibold text-gray-700 transition-all duration-300`}
      />
    </div>
  </div>
);

export default ProductEdit;
