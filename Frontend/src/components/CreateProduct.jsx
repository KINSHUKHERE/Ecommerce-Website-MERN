import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postProduct } from "../api/ProductApi";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    imgUrl: "",
    brandName: "",
    heading: "",
    price: "",
    description: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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
        brandName: "",
        heading: "",
        price: "",
        description: "",
      });
      setTimeout(() => navigate("/products"), 1500);
    } catch (err) {
      console.log("Unable to post data:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
      <div className="mb-5">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-[#088178] hover:text-white hover:border-[#088178] transition-all duration-300 shadow-sm font-semibold text-sm"
          >
            <span className="text-lg group-hover:-translate-x-1 transition-transform duration-300">
              &larr;
            </span>
            Back
          </Link>
        </div>
       
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
          
          {isSubmitted && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl font-semibold text-center border border-green-200">
              ✓ Product Added Successfully!
            </div>
          )}

          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
            Add New Product
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Fill in the details to list your item.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid for Responsive Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Image URL"
                name="imgUrl"
                value={formData.imgUrl}
                onChange={dataEntered}
                placeholder="https://example.com/image.jpg"
              />
              <InputField
                label="Brand Name"
                name="brandName"
                value={formData.brandName}
                onChange={dataEntered}
                placeholder="e.g. Nike"
              />
            </div>

            <InputField
              label="Product Title"
              name="heading"
              value={formData.heading}
              onChange={dataEntered}
              placeholder="e.g. Air Zoom Pegasus"
            />
            <InputField
              label="Price (₹)"
              name="price"
              type="number"
              value={formData.price}
              onChange={dataEntered}
              placeholder="8999"
            />

            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={dataEntered}
                required
                placeholder="Describe the product features..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/20 outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#088178] text-white font-bold py-4 rounded-xl hover:bg-[#06635c] transition-all shadow-lg active:scale-[0.98]"
            >
              Submit Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Component for cleaner code
const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) => (
  <div>
    <label className="block mb-2 text-sm font-bold text-gray-700">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#088178] focus:ring-2 focus:ring-[#088178]/20 outline-none transition-all"
    />
  </div>
);

export default CreateProduct;
