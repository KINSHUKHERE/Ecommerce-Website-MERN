const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/product-data-send", verifyUser, verifyAdmin, addProduct);
router.get("/get-product-data", getProducts);
router.delete("/product-delete/:id", verifyUser, verifyAdmin, deleteProduct);
router.patch("/product-update/:id", verifyUser, verifyAdmin, updateProduct);

module.exports = router;
