const Cart = require("../models/cartDetails");

const addItemsToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const existingItem = await Cart.findOne({
      userId,
      productId,
    });

    // Product already exists in cart
    if (existingItem) {
      existingItem.quantity += quantity || 1;

      await existingItem.save();

      return res.status(200).json({
        msg: "Cart quantity updated",
        cartItem: existingItem,
      });
    }

    // Product not in cart yet
    const cartItem = await Cart.create({
      userId,
      productId,
      quantity: quantity || 1,
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
    const { userId } = req.params;
    const cartData = await Cart.find({ userId: userId }).populate("productId");
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
