const express = require("express");
const router = express.Router();
const {
  toggleWishlist,
  getWishlistItems,
  removeFromWishlist,
} = require("../controllers/wishlistController");
const verifyUser = require("../middleware/verifyUser");

router.post("/wishlist/toggle", verifyUser, toggleWishlist);
router.get("/wishlist", verifyUser, getWishlistItems);
router.delete("/wishlist/:productId", verifyUser, removeFromWishlist);

module.exports = router;
