const Review = require("../models/reviewDetails");
const Order = require("../models/orderDetails");
const Product = require("../models/productsData");

// Add a product review
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.userId;
    const userName = req.user.name || "Customer";

    if (!productId || !rating || !comment) {
      return res.status(400).json({ msg: "Missing required review fields" });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ msg: "Rating must be between 1 and 5" });
    }

    // 1. Verify if the user has purchased this product and it is delivered
    const hasBought = await Order.findOne({
      userId,
      "items.productId": productId,
      orderStatus: "Delivered",
    });

    if (!hasBought) {
      return res.status(403).json({
        msg: "You can only review products that have been successfully delivered.",
      });
    }

    // 2. Check if the user has already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({
        msg: "You have already reviewed this product. You can only write one review per product.",
      });
    }

    // 3. Create review
    const review = await Review.create({
      productId,
      userId,
      userName,
      rating: Number(rating),
      comment,
    });

    return res.status(201).json({
      msg: "Review submitted successfully",
      review,
    });
  } catch (err) {
    console.error("Error adding review:", err);
    return res.status(500).json({ msg: "Server error while submitting review", error: err.message });
  }
};

// Get reviews for a single product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    return res.status(200).json({
      reviews,
    });
  } catch (err) {
    console.error("Error fetching product reviews:", err);
    return res.status(500).json({ msg: "Server error while fetching reviews", error: err.message });
  }
};

// Get reviews for a vendor's products
const getVendorReviews = async (req, res) => {
  try {
    let vendorId = req.user.userId;
    if (req.user.role === "admin" && req.query.vendorId) {
      vendorId = req.query.vendorId;
    }

    // Find all products belonging to this vendor
    const vendorProducts = await Product.find({ vendorId }).select("_id");
    const vendorProductIds = vendorProducts.map((p) => p._id);

    // Find reviews for these products
    const reviews = await Review.find({ productId: { $in: vendorProductIds } })
      .populate("productId", "heading imgUrl price")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      reviews,
    });
  } catch (err) {
    console.error("Error fetching vendor reviews:", err);
    return res.status(500).json({ msg: "Server error while fetching reviews", error: err.message });
  }
};

module.exports = {
  addReview,
  getProductReviews,
  getVendorReviews,
};
