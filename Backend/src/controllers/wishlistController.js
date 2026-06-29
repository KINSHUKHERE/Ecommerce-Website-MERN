const Wishlist = require("../models/wishlistDetails");
const Product = require("../models/productsData");
const Variant = require("../models/variantDetails");

const toggleWishlist = async (req, res) => {
  try {
    const { productId, variantId } = req.body;
    const userId = req.user.userId;

    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Find if already wishlisted
    const existing = await Wishlist.findOne({ userId, productId });

    if (existing) {
      // Remove it
      await Wishlist.findByIdAndDelete(existing._id);
      
      // Fetch all remaining wishlisted product IDs for the user
      const remaining = await Wishlist.find({ userId }).select("productId");
      const remainingIds = remaining.map((w) => w.productId.toString());

      return res.status(200).json({
        msg: "Removed from wishlist",
        isWishlisted: false,
        wishlistIds: remainingIds,
      });
    } else {
      // Add it
      let targetVariantId = variantId;
      if (!targetVariantId) {
        // Fallback to first available variant if product has variants
        const firstVariant = await Variant.findOne({ productId, isDeleted: false });
        if (firstVariant) {
          targetVariantId = firstVariant._id;
        }
      }

      await Wishlist.create({
        userId,
        productId,
        variantId: targetVariantId,
      });

      // Fetch all wishlisted product IDs for the user
      const allWishlisted = await Wishlist.find({ userId }).select("productId");
      const allWishlistedIds = allWishlisted.map((w) => w.productId.toString());

      return res.status(201).json({
        msg: "Added to wishlist",
        isWishlisted: true,
        wishlistIds: allWishlistedIds,
      });
    }
  } catch (err) {
    res.status(500).json({
      msg: "Error toggling wishlist",
      error: err.message,
    });
  }
};

const getWishlistItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find all wishlist entries for the user
    // Populate product, including category and brand
    const wishlistData = await Wishlist.find({ userId })
      .populate({
        path: "productId",
        populate: [
          { path: "categoryId" },
          { path: "brandId" }
        ]
      })
      .populate("variantId")
      .lean();

    // Filter out entries where product has been deleted from DB
    const validWishlist = wishlistData.filter(item => item.productId !== null);

    // Extract product IDs
    const productIds = validWishlist.map(item => item.productId._id);

    // Fetch variants for these products
    const variants = await Variant.find({ productId: { $in: productIds }, isDeleted: false });

    // Group variants by productId
    const variantsMap = {};
    variants.forEach(v => {
      const pidStr = v.productId.toString();
      if (!variantsMap[pidStr]) {
        variantsMap[pidStr] = [];
      }
      variantsMap[pidStr].push(v);
    });

    // Attach variants to product object in wishlist
    const finalWishlist = validWishlist.map(item => {
      const prod = item.productId;
      return {
        ...item,
        productId: {
          ...prod,
          variants: variantsMap[prod._id.toString()] || []
        }
      };
    });

    res.status(200).json({
      msg: "Fetched wishlist items",
      wishlistData: finalWishlist,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error fetching wishlist items",
      error: err.message,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    const deleted = await Wishlist.findOneAndDelete({ userId, productId });

    const remaining = await Wishlist.find({ userId }).select("productId");
    const remainingIds = remaining.map((w) => w.productId.toString());

    res.status(200).json({
      msg: "Item removed from wishlist",
      wishlistIds: remainingIds,
      deleted,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error removing from wishlist",
      error: err.message,
    });
  }
};

module.exports = {
  toggleWishlist,
  getWishlistItems,
  removeFromWishlist,
};
