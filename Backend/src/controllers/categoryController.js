const Category = require("../models/categoryDetails");

const addCategoryObj = async (req, res) => {
  try {
    const { name, commissionPercentage } = req.body;

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp("^" + name.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
      isDeleted: false,
    });

    if (existingCategory) {
      return res.status(409).json({
        msg: "Category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      commissionPercentage: commissionPercentage !== undefined ? Number(commissionPercentage) : 5,
    });

    res.status(201).json({
      msg: "Category created successfully",
      category,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to create category",
      error: err.message,
    });
  }
};

const getCategoriesList = async (req, res) => {
  try {
    const categories = await Category.find({
      isDeleted: false,
    });

    res.status(200).json({
      msg: "Categories fetched successfully",
      categories,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to fetch categories",
      error: err.message,
    });
  }
};

const updateCategoryObj = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, commissionPercentage } = req.body;

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp("^" + name.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
      isDeleted: false,
      _id: { $ne: id }
    });

    if (existingCategory) {
      return res.status(409).json({
        msg: "Category already exists",
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        commissionPercentage: commissionPercentage !== undefined ? Number(commissionPercentage) : 5,
      },
      {
        new: true,
      }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        msg: "Category not found",
      });
    }

    res.status(200).json({
      msg: "Category updated successfully",
      updatedCategory,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to update category",
      error: err.message,
    });
  }
};

const deleteCategoryObj = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({
        msg: "Category not found",
      });
    }

    res.status(200).json({
      msg: "Category deleted successfully",
      deletedCategory,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to delete category",
      error: err.message,
    });
  }
};

const toggleCategoryStatusObj = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        msg: "Category not found",
      });
    }

    category.isActive = !category.isActive;

    await category.save();

    res.status(200).json({
      msg: "Category status updated",
      category,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to update category status",
      error: err.message,
    });
  }
};

module.exports = {
  addCategory: addCategoryObj,
  getCategories: getCategoriesList,
  updateCategory: updateCategoryObj,
  deleteCategory: deleteCategoryObj,
  toggleCategoryStatus: toggleCategoryStatusObj,
};
