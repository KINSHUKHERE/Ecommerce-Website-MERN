const express = require("express");
const router = express.Router();
const {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} = require("../controllers/categoryController");

router.post("/add-category", addCategory);
router.get("/get-categories", getCategories);
router.put("/update-category/:id", updateCategory);
router.delete("/delete-category/:id", deleteCategory);
router.put("/toggle-category-status/:id", toggleCategoryStatus);

module.exports = router;
