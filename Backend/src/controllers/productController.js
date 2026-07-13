const Product = require("../models/productsData");
const Variant = require("../models/variantDetails");
const cloudinary = require("../config/cloudinary");
const User = require("../models/authDetails");
const { getVendorLifetimeSales, getRequiredMinimumBalance } = require("../utils/walletHelper");

const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    const pathSegments = afterUpload.split("/");
    if (pathSegments[0].match(/^v\d+$/)) {
      pathSegments.shift();
    }
    const fullPath = pathSegments.join("/");
    const lastDotIndex = fullPath.lastIndexOf(".");
    return lastDotIndex !== -1 ? fullPath.substring(0, lastDotIndex) : fullPath;
  } catch (err) {
    console.error("Error parsing Cloudinary URL:", err);
    return null;
  }
};

const isImageInUse = async (url, excludeProductId) => {
  const otherProductCount = await Product.countDocuments({
    _id: { $ne: excludeProductId },
    $or: [{ imgUrl: url }, { images: url }]
  });
  if (otherProductCount > 0) return true;

  const otherVariantCount = await Variant.countDocuments({
    productId: { $ne: excludeProductId },
    images: url
  });
  return otherVariantCount > 0;
};


const addProduct = async (req, res) => {
  try {
    const { variants, ...productData } = req.body;
    
    // Set vendorId to the current user's ID if vendor or admin
    if (req.user && req.user.userId) {
      productData.vendorId = req.user.userId;
    }

    // Wallet Balance Check
    const vendorId = req.user.userId;
    const vendor = await User.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    const lifetimeSales = await getVendorLifetimeSales(vendorId);
    const requiredMinBalance = await getRequiredMinimumBalance(lifetimeSales, vendor);

    if ((vendor.walletBalance || 0) < requiredMinBalance) {
      return res.status(403).json({
        msg: `Insufficient wallet balance. You must maintain a minimum balance of ₹${requiredMinBalance} based on your lifetime sales of ₹${lifetimeSales}. Your current balance is ₹${vendor.walletBalance || 0}. Please recharge your wallet before listing new products.`,
        requiredMinBalance,
        currentBalance: vendor.walletBalance || 0
      });
    }
    
    const product = await Product.create(productData);

    if (Array.isArray(variants) && variants.length > 0) {
      // Add productId and auto-generated unique SKU to each variant
      const variantsWithProductId = variants.map((v, idx) => {
        const shortName = product.heading
          .slice(0, 4)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "");
        const attrVals = v.attributes.map(a => a.value.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "")).join("-");
        const uniqueSuffix = `${idx}-${Math.floor(100 + Math.random() * 900)}`;
        const generatedSku = `SKU-${shortName}-${attrVals}-${uniqueSuffix}`;
        
        return {
          ...v,
          productId: product._id,
          sku: v.sku || generatedSku
        };
      });
      await Variant.insertMany(variantsWithProductId);
    } else {
      // Create a default Variant for flat products
      const shortName = product.heading
        .slice(0, 4)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
      const generatedSku = `SKU-${shortName}-${product._id.toString().slice(-4)}`;
      
      await Variant.create({
        productId: product._id,
        sku: generatedSku,
        price: req.body.price || 999,
        quantity: req.body.quantity || 10,
        images: [product.imgUrl],
        attributes: []
      });
    }

    // Fetch the inserted variants to return in response
    const finalVariants = await Variant.find({ productId: product._id, isDeleted: false });

    // Create notification for product addition
    try {
      const Notification = require("../models/notificationDetails");
      const User = require("../models/authDetails");
      const creator = await User.findById(req.user.userId);
      const creatorName = creator?.businessName || creator?.name || "Someone";
      await Notification.create({
        recipient: null,
        title: "New Product Listed",
        message: `"${creatorName}" listed a new product: "${product.heading}".`,
        type: "product",
        link: "/admin/products"
      });
    } catch (notifErr) {
      console.error("Failed to generate product notification:", notifErr);
    }

    res.status(201).json({
      msg: "Data sent successfully",
      product: {
        ...product.toObject(),
        variants: finalVariants
      }
    });
  } catch (err) {
    console.log("Product details enter karne me error hai", err);
    res.status(401).json({
      msg: "Product details enter karne me error hai",
      error: err.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const User = require("../models/authDetails");
    let filter = { status: "active" };

    if (req.query.vendorId) {
      filter = { vendorId: req.query.vendorId };
      if (!req.query.isAdminPanel) {
        filter.status = "active";
      }
    } else {
      // Find all active vendors
      const activeVendors = await User.find({ role: "vendor", vendorStatus: "active" }).select("_id");
      const activeVendorIds = activeVendors.map((v) => v._id);

      filter = {
        status: "active",
        $or: [
          { vendorId: null },
          { vendorId: { $in: activeVendorIds } }
        ]
      };
    }

    const products = await Product.find(filter)
      .populate("categoryId")
      .populate("brandId")
      .populate("vendorId", "name email phoneNumber businessName businessAddress gstin")
      .lean();

    const productIds = products.map(p => p._id);
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

    // Map variants back to products
    const data = products.map(p => ({
      ...p,
      variants: variantsMap[p._id.toString()] || []
    }));

    res.status(200).json({
      msg: "Data fetched",
      data,
    });
  } catch (err) {
    res.status(401).json({
      msg: "Unable to get data",
      error: err.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const productToDelete = await Product.findById(id);
    if (!productToDelete) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Ownership check: must be admin OR the vendor who owns the product
    if (req.user.role === "vendor" && productToDelete.vendorId && productToDelete.vendorId.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Forbidden: You do not own this product" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    // Collect all image URLs from the product and its variants
    const imageUrls = new Set();
    if (deletedProduct.imgUrl) imageUrls.add(deletedProduct.imgUrl);
    if (Array.isArray(deletedProduct.images)) {
      deletedProduct.images.forEach(img => {
        if (img) imageUrls.add(img);
      });
    }

    // Fetch all variants associated with this product (active and soft-deleted)
    const productVariants = await Variant.find({ productId: id });
    productVariants.forEach(variant => {
      if (Array.isArray(variant.images)) {
        variant.images.forEach(img => {
          if (img) imageUrls.add(img);
        });
      }
    });

    // Delete unique images from Cloudinary if they are not in use by other products/variants
    for (const url of imageUrls) {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) {
        const inUse = await isImageInUse(url, id);
        if (!inUse) {
          try {
            console.log(`Deleting image from Cloudinary: ${publicId}`);
            await cloudinary.uploader.destroy(publicId);
          } catch (destroyErr) {
            console.error(`Failed to destroy image ${publicId} on Cloudinary:`, destroyErr.message);
          }
        } else {
          console.log(`Image ${url} is in use by another product or variant. Skipping deletion.`);
        }
      }
    }

    // Permanently delete all variants of this product from database
    await Variant.deleteMany({ productId: id });

    res.status(200).json({
      msg: "Product deleted successfully",
      deletedProduct,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error deleting product",
      error: err.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { variants, ...productData } = req.body;

    const productToUpdate = await Product.findById(id);
    if (!productToUpdate) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Ownership check: must be admin OR the vendor who owns the product
    if (req.user.role === "vendor" && productToUpdate.vendorId && productToUpdate.vendorId.toString() !== req.user.userId) {
      return res.status(403).json({ msg: "Forbidden: You do not own this product" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true }
    ).lean();

    if (!updatedProduct) {
      return res.status(404).json({ msg: "Product not found" });
    }

    if (Array.isArray(variants)) {
      // Fetch currently existing variants in DB
      const dbVariants = await Variant.find({ productId: id, isDeleted: false });
      const dbVariantIds = dbVariants.map(v => v._id.toString());

      // Separate variants into updates and creations
      const incomingVariantIds = variants.filter(v => v._id).map(v => v._id.toString());

      // Soft delete variants that are not present in incoming list
      const idsToDelete = dbVariantIds.filter(idStr => !incomingVariantIds.includes(idStr));
      if (idsToDelete.length > 0) {
        await Variant.updateMany({ _id: { $in: idsToDelete } }, { isDeleted: true });
      }

      for (const variant of variants) {
        if (variant._id) {
          // Update existing
          await Variant.findByIdAndUpdate(variant._id, {
            sku: variant.sku,
            price: variant.price,
            quantity: variant.quantity,
            images: variant.images,
            attributes: variant.attributes,
            isActive: variant.isActive,
            onSale: variant.onSale,
            salePrice: variant.salePrice,
          });
        } else {
          // Create new variant
          const shortName = updatedProduct.heading
            .slice(0, 4)
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "");
          const attrVals = variant.attributes.map(a => a.value.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "")).join("-");
          const uniqueSuffix = `${Math.floor(1000 + Math.random() * 9000)}`;
          const generatedSku = `SKU-${shortName}-${attrVals}-${uniqueSuffix}`;

          await Variant.create({
            ...variant,
            productId: id,
            sku: variant.sku || generatedSku
          });
        }
      }
    }

    // Fetch final active variants
    const finalVariants = await Variant.find({ productId: id, isDeleted: false });

    res.status(200).json({
      msg: "Product updated successfully",
      updatedProduct: {
        ...updatedProduct,
        variants: finalVariants
      },
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error updating product",
      error: err.message,
    });
  }
};

module.exports = {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
};
