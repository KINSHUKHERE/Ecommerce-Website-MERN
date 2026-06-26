const Product = require("../models/productsData");
const Variant = require("../models/variantDetails");

const addProduct = async (req, res) => {
  try {
    const { variants, ...productData } = req.body;
    
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
    const products = await Product.find()
      .populate("categoryId")
      .populate("brandId")
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
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // Soft delete all variants of this product
    await Variant.updateMany({ productId: id }, { isDeleted: true });

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
            isActive: variant.isActive
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
