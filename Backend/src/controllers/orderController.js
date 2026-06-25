const Order = require("../models/orderDetails");
const Cart = require("../models/cartDetails");
const Product = require("../models/productsData");

const createOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      transactionId,
    } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0 || !totalAmount || !shippingAddress || !paymentMethod || !transactionId) {
      return res.status(400).json({
        msg: "Missing required fields for order creation",
      });
    }

    // Create the order
    const newOrder = await Order.create({
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      transactionId,
      paymentStatus: "Paid",
      orderStatus: "Processing",
    });

    // Update product quantities
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity = Math.max(0, (product.quantity ?? 10) - item.quantity);
        if (product.quantity <= 0) {
          product.sold = true;
        }
        await product.save();
      }
    }

    // Clear user's cart
    await Cart.deleteMany({ userId });

    res.status(201).json({
      msg: "Order created successfully and cart cleared",
      order: newOrder,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to create order",
      Error: err.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      msg: "Retrieved all orders",
      orders,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to retrieve orders",
      Error: err.message,
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      msg: "Retrieved user orders",
      orders,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to retrieve user orders",
      Error: err.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    ).populate("userId", "name email");

    if (!updatedOrder) {
      return res.status(404).json({
        msg: "Order not found",
      });
    }

    res.status(200).json({
      msg: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to update order status",
      Error: err.message,
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
};
