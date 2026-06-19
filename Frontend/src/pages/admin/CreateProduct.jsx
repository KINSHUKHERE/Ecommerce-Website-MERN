import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postProduct } from "../../api/ProductApi";
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
  ArrowLeft
} from "lucide-react";

const CreateProduct = () => {
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postProduct(formData);
      setIsSubmitted(true);
      setFormData({
        imgUrl: "",
        categoryId: "",
        variantId: "",
        heading: "",
        price: "",
        quantity: "",
        description: "",
      });
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
      variantId: "",
    }));

    try {
      const response = await getVariantsByCategory(categoryId);
      setVariants(response.data.variants);
    } catch (err) {
      console.log("Unable to fetch variants", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/10 to-slate-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-150 p-5 sm:p-7 relative overflow-hidden">
          {/* Decorative Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#15877F] to-[#088178]"></div>

          {isSubmitted && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg font-bold text-center border border-green-200 shadow-sm text-sm">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image URL Input */}
            <InputField
              label="Image URL"
              name="imgUrl"
              value={formData.imgUrl}
              onChange={dataEntered}
              placeholder="https://example.com/image.jpg"
              icon={LinkIcon}
            />

            {/* Grid for Category & Variant dropdowns */}
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
                    className="w-full pl-9 pr-10 py-2 rounded-lg border border-gray-200 bg-white focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/20 outline-none transition-all text-gray-800 text-sm font-medium appearance-none cursor-pointer"
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

              {/* Variant Select */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-650 uppercase tracking-wider text-left">
                  Variant
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                    <Layers size={16} />
                  </span>
                  <select
                    value={formData.variantId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        variantId: e.target.value,
                      })
                    }
                    required
                    disabled={!formData.categoryId}
                    className="w-full pl-9 pr-10 py-2 rounded-lg border border-gray-200 bg-white focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/20 outline-none transition-all text-gray-850 text-sm font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Variant</option>
                    {variants.map((variant) => (
                      <option key={variant._id} value={variant._id}>
                        {variant.name}
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
              className="w-full bg-gradient-to-r from-[#15877F] to-[#088178] text-white font-bold py-2.5 rounded-lg hover:from-[#126b64] hover:to-[#06635c] transition-all duration-300 shadow-sm hover:shadow shadow-[#088178]/10 active:scale-[0.99] flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider mt-2 cursor-pointer"
            >
              <Sparkles size={16} />
              Submit Product Details
            </button>
          </form>
        </div>
      </div>
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
    <label className="block mb-1.5 text-xs font-bold text-gray-650 uppercase tracking-wider text-left">
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
        } pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/20 outline-none transition-all text-gray-800 text-sm bg-white placeholder-gray-400 font-medium`}
      />
    </div>
  </div>
);

export default CreateProduct;
