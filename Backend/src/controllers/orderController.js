const Order = require("../models/orderDetails");
const Cart = require("../models/cartDetails");
const Product = require("../models/productsData");
const Variant = require("../models/variantDetails");

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

    // Update variant and product quantities
    for (const item of items) {
      if (item.variantId) {
        const variant = await Variant.findById(item.variantId);
        if (variant) {
          variant.quantity = Math.max(0, variant.quantity - item.quantity);
          await variant.save();
        }
      } else {
        // Fallback for older flat products
        const product = await Product.findById(item.productId);
        if (product) {
          product.quantity = Math.max(0, (product.quantity ?? 10) - item.quantity);
          if (product.quantity <= 0) {
            product.sold = true;
          }
          await product.save();
        }
      }
    }

    // Clear user's cart
    await Cart.deleteMany({ userId });

    // Create notifications for vendors & admin
    try {
      const Notification = require("../models/notificationDetails");
      
      // Group items by vendor
      const vendorItemsMap = {};
      for (const item of items) {
        const prod = await Product.findById(item.productId);
        if (prod && prod.vendorId) {
          const vIdStr = prod.vendorId.toString();
          if (!vendorItemsMap[vIdStr]) {
            vendorItemsMap[vIdStr] = [];
          }
          vendorItemsMap[vIdStr].push(item);
        }
      }

      // 1. Create vendor notifications
      for (const [vendorId, vendorItems] of Object.entries(vendorItemsMap)) {
        const itemNames = vendorItems.map(item => item.name).join(", ");
        await Notification.create({
          recipient: vendorId,
          title: "New Order Received",
          message: `You received a new order for: ${itemNames}.`,
          type: "order",
          link: "/vendor/order-details"
        });
      }

      // 2. Create admin notification
      await Notification.create({
        recipient: null,
        title: "New Order Placed",
        message: `Order #${newOrder._id.toString().slice(-8)} has been placed for a total of ₹${totalAmount}.`,
        type: "order",
        link: "/order-details"
      });
    } catch (notifErr) {
      console.error("Failed to generate order notifications:", notifErr);
    }

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
    let orders;
    if (req.user.role === "vendor") {
      // Find all products owned by this vendor
      const vendorProducts = await Product.find({ vendorId: req.user.userId }).select("_id");
      const vendorProductIds = vendorProducts.map((p) => p._id.toString());

      // Find orders containing any of these products
      const rawOrders = await Order.find({ "items.productId": { $in: vendorProductIds } })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .lean();

      // Filter items to show only vendor's products, and recalculate total
      orders = rawOrders.map((order) => {
        const filteredItems = order.items.filter(
          (item) => item.productId && vendorProductIds.includes(item.productId.toString())
        );
        const vendorTotal = filteredItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        return {
          ...order,
          items: filteredItems,
          totalAmount: vendorTotal,
        };
      });
    } else {
      // Super Admin sees all orders
      orders = await Order.find()
        .populate("userId", "name email")
        .populate("items.productId")
        .sort({ createdAt: -1 });
    }

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

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        msg: "Order not found",
      });
    }

    // Ownership check: if vendor, they must own at least one item in the order
    if (req.user.role === "vendor") {
      const vendorProducts = await Product.find({ vendorId: req.user.userId }).select("_id");
      const vendorProductIds = vendorProducts.map((p) => p._id.toString());
      const hasVendorItem = order.items.some(
        (item) => item.productId && vendorProductIds.includes(item.productId.toString())
      );
      if (!hasVendorItem) {
        return res.status(403).json({
          msg: "Forbidden: You do not own any products in this order",
        });
      }
    }

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
