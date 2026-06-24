const express = require("express");
const router = express.Router();
const {
  addVariant,
  getVariants,
  getVariantsByCategory,
  updateVariant,
  deleteVariant,
  toggleVariantStatus,
} = require("../controllers/variantController");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/add-variant", verifyUser, verifyAdmin, addVariant);
router.get("/get-variants", getVariants);
router.get("/get-variants/:categoryId", getVariantsByCategory);
router.put("/update-variant/:id", verifyUser, verifyAdmin, updateVariant);
router.delete("/delete-variant/:id", verifyUser, verifyAdmin, deleteVariant);
router.put("/toggle-variant-status/:id", verifyUser, verifyAdmin, toggleVariantStatus);

module.exports = router;
