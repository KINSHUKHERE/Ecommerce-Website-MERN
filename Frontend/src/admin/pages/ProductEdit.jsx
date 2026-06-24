import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct, updateProduct } from "../../api/ProductApi";
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
  Image as ImageIcon
} from "lucide-react";

const ProductEdit = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    imgUrl: "",
    categoryId: "",
    variantId: "",
    heading: "",
    price: "",
    quantity: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

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
            imgUrl: product.imgUrl || "",
            categoryId: categoryId || "",
            variantId: product.variantId?._id || product.variantId || "",
            heading: product.heading || "",
            price: product.price || "",
            quantity: product.quantity ?? 10,
            description: product.description || "",
          });

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
      document.title = `VELTIQ | Admin - Edit ${formData.heading}`;
    }
  }, [formData.heading]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "imgUrl") {
      setImgLoadError(false);
    }
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
    setSaving(true);

    try {
      await updateProduct(productId, formData);
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
              {/* Image URL Input */}
              <InputField
                label="Image URL Link"
                name="imgUrl"
                value={formData.imgUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                icon={LinkIcon}
              />

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
                {formData.imgUrl && !imgLoadError ? (
                  <img
                    src={formData.imgUrl}
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
              {formData.imgUrl && !imgLoadError && (
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
