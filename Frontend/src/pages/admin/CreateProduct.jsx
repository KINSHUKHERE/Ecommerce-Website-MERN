import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postProduct, uploadProductImage } from "../../api/ProductApi";
import {
  getCategories,
  getBrandsByCategory,
} from "../../api/CategoryAndBrandApi";
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
  Upload,
  Trash2,
  Loader2,
  Check,
  X,
  Image as ImageIcon
} from "lucide-react";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    categoryId: "",
    brandId: "",
    heading: "",
    price: "",
    quantity: "",
    description: "",
  });
  
  const [productImages, setProductImages] = useState([]); // Max 6 images
  const [imageInputMethod, setImageInputMethod] = useState("upload"); // "upload" | "url"
  const [urlInput, setUrlInput] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("error");

  const showToast = (msg, type = "error") => {
    setMessage(msg);
    setToastType(type);
    setTimeout(() => setMessage(""), 4000);
  };
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.categories);
    } catch (err) {
      console.log("Unable to fetch categories", err);
    }
  };

  const dataEntered = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (productImages.length + files.length > 6) {
      showToast("You can add up to 6 images only.");
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map((file) => uploadProductImage(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map((res) => res.data.url);
      setProductImages((prev) => [...prev, ...urls]);
    } catch (err) {
      console.error("Image upload failed:", err);
      showToast("Failed to upload one or more images");
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    if (!urlInput.trim()) return;
    if (productImages.length >= 6) {
      showToast("You can add up to 6 images only.");
      return;
    }
    setProductImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (productImages.length === 0) {
      showToast("Please upload or add at least one product image.");
      return;
    }
    const finalData = {
      ...formData,
      imgUrl: productImages[0],
      images: productImages.slice(1),
    };
    try {
      await postProduct(finalData);
      setIsSubmitted(true);
      setFormData({
        categoryId: "",
        brandId: "",
        heading: "",
        price: "",
        quantity: "",
        description: "",
      });
      setProductImages([]);
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (err) {
      console.log("Unable to post data:", err);
    }
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      categoryId,
      brandId: "",
    }));

    try {
      const response = await getBrandsByCategory(categoryId);
      setBrands(response.data.brands);
    } catch (err) {
      console.log("Unable to fetch brands", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/10 to-slate-100 px-4 py-8">
      <div className="max-w-2xl mx-auto text-left">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-250 hover:border-gray-300 text-gray-700 hover:text-gray-900 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Registry
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-5 sm:p-7 relative overflow-hidden">
          {/* Decorative Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#15877F] to-[#088178]"></div>

          {isSubmitted && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg font-bold text-center border border-green-200 shadow-sm text-sm animate-fadeIn">
              ✓ Product Added Successfully! Redirecting...
            </div>
          )}

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#15877F] to-[#088178] mb-1.5">
              Add New Product
            </h1>
            <p className="text-gray-500 font-medium text-xs sm:text-sm">
              List a new premium electronic item in the store catalog.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
                       {/* Unified Product Images Manager */}
            <div className="space-y-4 border-b border-slate-100 pb-5">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="space-y-0.5">
                  <label className="block text-xs font-bold text-gray-655 uppercase tracking-wider">
                    Product Images ({productImages.length}/6)
                  </label>
                  <p className="text-[10px] text-gray-450 font-medium">
                    The first image will automatically be set as the Primary Cover.
                  </p>
                </div>
                
                {/* Single Mode Selector pills */}
                {productImages.length < 6 && (
                  <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod("upload")}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        imageInputMethod === "upload"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-gray-550 hover:text-gray-800"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod("url")}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        imageInputMethod === "url"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-gray-550 hover:text-gray-800"
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
                  <label className="w-full h-24 border-2 border-dashed border-gray-305 rounded-xl flex flex-col items-center justify-center p-3 hover:border-[#088178] hover:bg-[#088178]/5 transition-all cursor-pointer">
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
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                        <LinkIcon size={15} />
                      </span>
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Paste image link URL here..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-205 focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/20 outline-none transition-all text-gray-800 text-xs bg-white placeholder-gray-400 font-medium h-[36px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="px-4 py-1.5 bg-[#088178] hover:bg-[#06635c] text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center h-[36px]"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
                  {productImages.map((url, index) => (
                    <div
                      key={index}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative aspect-square border rounded-xl bg-gray-50 flex items-center justify-center p-1.5 overflow-hidden shadow-sm group transition-all cursor-grab active:cursor-grabbing ${
                        index === 0 ? "border-[#088178]/40 ring-2 ring-[#088178]/5" : "border-gray-200"
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

            {/* Grid for Category & Brand dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Select */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-650 uppercase tracking-wider text-left">
                  Category
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <Tag size={16} />
                  </span>
                  <select
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    required
                    className="w-full pl-9 pr-10 py-2 rounded-lg border border-gray-200 bg-white focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/20 outline-none transition-all text-gray-800 text-sm font-medium appearance-none cursor-pointer h-[38px]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </span>
                </div>
              </div>

              {/* Brand Select */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-650 uppercase tracking-wider text-left">
                  Brand
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <Layers size={16} />
                  </span>
                  <select
                    value={formData.brandId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brandId: e.target.value,
                      })
                    }
                    required
                    disabled={!formData.categoryId}
                    className="w-full pl-9 pr-10 py-2 rounded-lg border border-gray-200 bg-white focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/20 outline-none transition-all text-gray-850 text-sm font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[38px]"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Product Title */}
            <InputField
              label="Product Title"
              name="heading"
              value={formData.heading}
              onChange={dataEntered}
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              icon={Heading}
            />

            {/* Pricing and Stock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Price (₹)"
                name="price"
                type="number"
                value={formData.price}
                onChange={dataEntered}
                placeholder="29990"
                icon={IndianRupee}
              />
              <InputField
                label="Quantity Available"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={dataEntered}
                placeholder="10"
                icon={Box}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-1.5 text-xs font-bold text-gray-650 uppercase tracking-wider text-left">
                Description
              </label>
              <div className="relative">
                <span className="absolute top-2.5 left-3.5 text-gray-400 pointer-events-none">
                  <AlignLeft size={16} />
                </span>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={dataEntered}
                  required
                  placeholder="Describe the product features, specs, and specifications..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/20 outline-none transition-all resize-none text-gray-800 text-sm font-medium placeholder-gray-400 bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#15877F] to-[#088178] text-white font-bold py-2.5 rounded-lg hover:from-[#126b64] hover:to-[#06635c] transition-all duration-300 shadow-sm hover:shadow shadow-[#088178]/10 active:scale-[0.99] flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider mt-2 cursor-pointer h-[40px]"
            >
              <Sparkles size={16} />
              Submit Product Details
            </button>
          </form>
        </div>
      </div>
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
    </div>
  );
};

// Reusable input component with icons
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
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
          <Icon size={16} />
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
          Icon ? "pl-9" : "px-4"
        } pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/20 outline-none transition-all text-gray-800 text-sm bg-white placeholder-gray-400 font-medium h-[38px]`}
      />
    </div>
  </div>
);

export default CreateProduct;
