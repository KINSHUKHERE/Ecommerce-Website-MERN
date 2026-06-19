import React, { useEffect, useState } from "react";
import {
  addVariant,
  getVariants,
  updateVariant,
  deleteVariant,
  getCategories,
} from "../../api/CategoryAndVarientApi";

const VariantManagement = () => {
  const [variantName, setVariantName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.categories);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchVariants = async () => {
    try {
      const response = await getVariants();
      setVariants(response.data.variants);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([fetchCategories(), fetchVariants()]);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!variantName || !categoryId) {
      return;
    }

    try {
      if (editingId) {
        await updateVariant(editingId, {
          name: variantName,
          categoryId,
        });

        setMessage("Variant updated successfully");
      } else {
        await addVariant({
          name: variantName,
          categoryId,
        });

        setMessage("Variant added successfully");
      }

      setVariantName("");
      setCategoryId("");
      setEditingId(null);

      fetchVariants();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (variant) => {
    setEditingId(variant._id);
    setVariantName(variant.name);
    setCategoryId(variant.categoryId._id);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this variant?",
    );

    if (!confirmDelete) return;

    try {
      await deleteVariant(id);

      fetchVariants();

      setMessage("Variant deleted successfully");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-[#15877F]">
            Variant Management
          </h1>

          <p className="text-gray-500 mt-2">
            Manage product variants and brands
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-5 rounded-lg bg-green-100 border border-green-300 px-4 py-3 text-green-700 font-medium">
            {message}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Update Variant" : "Add Variant"}
          </h2>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#15877F]"
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Enter Variant Name"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#15877F]"
            />

            <button
              type="submit"
              className="bg-[#15877F] text-white rounded-lg px-6 py-3 hover:bg-[#126b64]"
            >
              {editingId ? "Update Variant" : "Add Variant"}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">All Variants</h2>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#15877F]"></div>
              <p className="text-gray-500 mt-3 text-sm animate-pulse">Fetching variants...</p>
            </div>
          ) : variants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No variants found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#15877F] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Variant Name</th>

                    <th className="px-6 py-4 text-left">Category</th>

                    <th className="px-6 py-4 text-center">Status</th>

                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{variant.name}</td>

                      <td className="px-6 py-4">{variant.categoryId?.name}</td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            variant.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {variant.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(variant)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(variant._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariantManagement;
