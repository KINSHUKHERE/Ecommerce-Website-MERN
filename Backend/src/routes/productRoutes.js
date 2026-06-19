const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");

router.post("/product-data-send", addProduct);
router.get("/get-product-data", getProducts);
router.delete("/product-delete/:id", deleteProduct);
router.patch("/product-update/:id", updateProduct);

module.exports = router;
