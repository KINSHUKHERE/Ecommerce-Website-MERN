const express = require("express");
const router = express.Router();
const {
  addBrand,
  getBrands,
  getBrandsByCategory,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
} = require("../controllers/brandController");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/add-brand", verifyUser, verifyAdmin, addBrand);
router.get("/get-brands", getBrands);
router.get("/get-brands/:categoryId", getBrandsByCategory);
router.put("/update-brand/:id", verifyUser, verifyAdmin, updateBrand);
router.delete("/delete-brand/:id", verifyUser, verifyAdmin, deleteBrand);
router.put("/toggle-brand-status/:id", verifyUser, verifyAdmin, toggleBrandStatus);

module.exports = router;
