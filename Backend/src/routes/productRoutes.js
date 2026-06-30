const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const verifyUser = require("../middleware/verifyUser");
const verifyVendorOrAdmin = require("../middleware/verifyVendorOrAdmin");

router.post("/product-data-send", verifyUser, verifyVendorOrAdmin, addProduct);
router.get("/get-product-data", getProducts);
router.delete("/product-delete/:id", verifyUser, verifyVendorOrAdmin, deleteProduct);
router.patch("/product-update/:id", verifyUser, verifyVendorOrAdmin, updateProduct);

module.exports = router;
