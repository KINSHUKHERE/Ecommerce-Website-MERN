const express = require("express");
const router = express.Router();
const {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} = require("../controllers/categoryController");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/add-category", verifyUser, verifyAdmin, addCategory);
router.get("/get-categories", getCategories);
router.put("/update-category/:id", verifyUser, verifyAdmin, updateCategory);
router.delete("/delete-category/:id", verifyUser, verifyAdmin, deleteCategory);
router.put("/toggle-category-status/:id", verifyUser, verifyAdmin, toggleCategoryStatus);

module.exports = router;
