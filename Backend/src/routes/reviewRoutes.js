const express = require("express");
const router = express.Router();
const {
  addReview,
  getProductReviews,
  getVendorReviews,
} = require("../controllers/reviewController");
const verifyUser = require("../middleware/verifyUser");

router.post("/reviews", verifyUser, addReview);
router.get("/reviews/product/:productId", getProductReviews);
router.get("/reviews/vendor", verifyUser, getVendorReviews);

module.exports = router;
