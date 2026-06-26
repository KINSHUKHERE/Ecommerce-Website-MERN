const Cart = require("../models/cartDetails");
const Product = require("../models/productsData");
const Variant = require("../models/variantDetails");

const addItemsToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user.userId;
    const qtyToAdd = quantity || 1;

    let targetVariantId = variantId;

    // Fallback: If variantId is not provided, fetch the default variant for this product
    if (!targetVariantId) {
      const defaultVariant = await Variant.findOne({ productId, attributes: { $size: 0 }, isDeleted: false });
      if (!defaultVariant) {
        return res.status(404).json({
          msg: "Product has no variants available",
        });
      }
      targetVariantId = defaultVariant._id;
    }

    // Fetch variant to check stock
    const variant = await Variant.findById(targetVariantId);
    if (!variant || variant.isDeleted) {
      return res.status(404).json({
        msg: "Selected variant not found",
      });
    }

    const existingItem = await Cart.findOne({
      userId,
      productId,
      variantId: targetVariantId,
    });

    // Product already exists in cart
    if (existingItem) {
      const newQty = existingItem.quantity + qtyToAdd;
      if (newQty > variant.quantity) {
        return res.status(400).json({
          msg: `Cannot add more. Only ${variant.quantity} items available in stock.`,
        });
      }
      existingItem.quantity = newQty;

      await existingItem.save();

      return res.status(200).json({
        msg: "Cart quantity updated",
        cartItem: existingItem,
      });
    }

    // Product not in cart yet
    if (qtyToAdd > variant.quantity) {
      return res.status(400).json({
        msg: `Cannot add. Only ${variant.quantity} items available in stock.`,
      });
    }

    const cartItem = await Cart.create({
      userId,
      productId,
      variantId: targetVariantId,
      quantity: qtyToAdd,
    });

    res.status(201).json({
      msg: "Added to cart",
      cartItem,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to add product to cart",
      Error: err.message,
    });
  }
};

const getItemsCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cartData = await Cart.find({ userId: userId })
      .populate("productId")
      .populate("variantId");
    res.status(200).json({
      msg: "Got data from cart",
      cartData,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to get data from cart",
      Error: err.message,
    });
  }
};

const increaseCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cartItem = await Cart.findById(cartId);

    if (!cartItem) {
      return res.status(404).json({
        msg: "Cart item not found",
      });
    }

    if (cartItem.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        msg: "Forbidden: You do not own this cart item",
      });
    }

    const variant = await Variant.findById(cartItem.variantId);
    if (!variant || variant.isDeleted) {
      return res.status(404).json({
        msg: "Product variant not found",
      });
    }

    if (cartItem.quantity + 1 > variant.quantity) {
      return res.status(400).json({
        msg: `Cannot increase. Only ${variant.quantity} items available in stock.`,
      });
    }

    cartItem.quantity += 1;

    await cartItem.save();

    res.status(200).json({
      msg: "Quantity increased",
      cartItem,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to increase quantity",
      Error: err.message,
    });
  }
};

const decreaseCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cartItem = await Cart.findById(cartId);

    if (!cartItem) {
      return res.status(404).json({
        msg: "Cart item not found",
      });
    }

    if (cartItem.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        msg: "Forbidden: You do not own this cart item",
      });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
    }

    res.status(200).json({
      msg: "Quantity decreased",
      cartItem,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to decrease quantity",
      Error: err.message,
    });
  }
};

const deleteCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cartItem = await Cart.findById(cartId);

    if (!cartItem) {
      return res.status(404).json({
        msg: "Cart item not found",
      });
    }

    if (cartItem.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        msg: "Forbidden: You do not own this cart item",
      });
    }

    const deletedItem = await Cart.findByIdAndDelete(cartId);

    if (!deletedItem) {
      return res.status(404).json({
        msg: "Cart item not found",
      });
    }

    res.status(200).json({
      msg: "Item removed from cart",
      deletedItem,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to delete cart item",
      Error: err.message,
    });
  }
};

module.exports = {
  addItemsToCart,
  getItemsCart,
  increaseCart,
  decreaseCart,
  deleteCart,
};
