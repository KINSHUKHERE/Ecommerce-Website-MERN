const express = require("express");
const router = express.Router();
const {
  addItemsToCart,
  getItemsCart,
  increaseCart,
  decreaseCart,
  deleteCart,
} = require("../controllers/cartController");
const verifyUser = require("../middleware/verifyUser");

router.post("/add-items-cart", verifyUser, addItemsToCart);
router.get("/get-items-cart", verifyUser, getItemsCart);
router.put("/increase-cart/:cartId", verifyUser, increaseCart);
router.put("/decrease-cart/:cartId", verifyUser, decreaseCart);
router.delete("/delete-cart/:cartId", verifyUser, deleteCart);

module.exports = router;
