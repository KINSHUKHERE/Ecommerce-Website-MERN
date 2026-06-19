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

router.post("/add-variant", addVariant);
router.get("/get-variants", getVariants);
router.get("/get-variants/:categoryId", getVariantsByCategory);
router.put("/update-variant/:id", updateVariant);
router.delete("/delete-variant/:id", deleteVariant);
router.put("/toggle-variant-status/:id", toggleVariantStatus);

module.exports = router;
