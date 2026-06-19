const express = require("express");
const router = express.Router();
const {
  addItemsToCart,
  getItemsCart,
  increaseCart,
  decreaseCart,
  deleteCart,
} = require("../controllers/cartController");

router.post("/add-items-cart", addItemsToCart);
router.get("/get-items-cart/:userId", getItemsCart);
router.put("/increase-cart/:cartId", increaseCart);
router.put("/decrease-cart/:cartId", decreaseCart);
router.delete("/delete-cart/:cartId", deleteCart);

module.exports = router;
