const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  bulkActionProducts,
} = require("../controllers/productController");
const verifyUser = require("../middleware/verifyUser");
const verifyVendorOrAdmin = require("../middleware/verifyVendorOrAdmin");

router.post("/product-data-send", verifyUser, verifyVendorOrAdmin, addProduct);
router.get("/get-product-data", getProducts);
router.delete("/product-delete/:id", verifyUser, verifyVendorOrAdmin, deleteProduct);
router.patch("/product-update/:id", verifyUser, verifyVendorOrAdmin, updateProduct);
router.patch("/product-bulk-action", verifyUser, verifyVendorOrAdmin, bulkActionProducts);

module.exports = router;
