import React, { useEffect, useState } from "react";
import {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../../api/CategoryAndVarientApi";

const CategoryManagement = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data.categories);
    } catch (err) {
      console.log("Unable to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) return;

    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: categoryName,
        });

        setMessage("Category updated successfully");
      } else {
        await addCategory({
          name: categoryName,
        });

        setMessage("Category added successfully");
      }

      setCategoryName("");
      setEditingId(null);
      fetchCategories();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.msg || "Something went wrong");
    }
  };

  const handleEdit = (category) => {
    setCategoryName(category.name);
    setEditingId(category._id);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmDelete) return;

    try {
      await deleteCategory(id);

      setMessage("Category deleted successfully");

      fetchCategories();

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
            Category Management
          </h1>

          <p className="text-gray-500 mt-2">
            Create, update and manage product categories
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-5 rounded-lg bg-green-100 border border-green-300 px-4 py-3 text-green-700 font-medium">
            {message}
          </div>
        )}

        {/* Add Category Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Update Category" : "Add New Category"}
          </h2>
          

          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4"
          >
            <input
              type="text"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#15877F]"
            />

            <button
              type="submit"
              className="bg-[#15877F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#126b64] transition"
            >
              {editingId ? "Update Category" : "Add Category"}
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">All Categories</h2>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#15877F]"></div>
              <p className="text-gray-500 mt-3 text-sm animate-pulse">Fetching categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No categories found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#15877F] text-white">
                  <tr>
                    <th className="text-left px-6 py-4">Category Name</th>

                    <th className="text-center px-6 py-4">Status</th>

                    <th className="text-center px-6 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium">{category.name}</td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            category.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(category)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(category._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
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

export default CategoryManagement;
