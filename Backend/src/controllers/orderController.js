const Order = require("../models/orderDetails");
const Cart = require("../models/cartDetails");
const Product = require("../models/productsData");
const Variant = require("../models/variantDetails");
const User = require("../models/authDetails");
const WalletTransaction = require("../models/walletTransaction");
const Category = require("../models/categoryDetails");
const { getVendorLifetimeSales, getRequiredMinimumBalance } = require("../utils/walletHelper");
const {
  computeOrderTotals,
  reserveStock,
  releaseStock,
  createOrderNotifications,
} = require("../utils/orderHelper");

const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      transactionId,
    } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0 || !shippingAddress || !paymentMethod || !transactionId) {
      return res.status(400).json({
        msg: "Missing required fields for order creation",
      });
    }

    // Only allow gateway-less methods (COD) through this endpoint. Card/UPI/
    // Razorpay orders must go through the signature-verified payment flow so the
    // amount is proven paid before an order is recorded.
    if (paymentMethod !== "COD") {
      return res.status(400).json({
        msg: "Online payments must be completed through the secure payment flow.",
      });
    }

    // Recompute prices & totals authoritatively from the DB (never trust client).
    let totals;
    try {
      totals = await computeOrderTotals(items);
    } catch (priceErr) {
      return res.status(priceErr.statusCode || 400).json({ msg: priceErr.message });
    }

    // Reserve stock atomically before creating the order (prevents overselling).
    const reservation = await reserveStock(totals.pricedItems);
    if (!reservation.ok) {
      return res.status(409).json({ msg: reservation.message });
    }

    let newOrder;
    try {
      newOrder = await Order.create({
        userId,
        items: totals.pricedItems,
        totalAmount: totals.expectedTotal,
        shippingAddress,
        paymentMethod,
        transactionId,
        paymentStatus: "Paid",
        orderStatus: "Processing",
      });
    } catch (createErr) {
      await releaseStock(totals.pricedItems);
      throw createErr;
    }

    // Clear user's cart
    await Cart.deleteMany({ userId });

    await createOrderNotifications(newOrder, totals.pricedItems);

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
    const Order = require("../models/orderDetails");
    const Review = require("../models/reviewDetails");

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const reviews = await Review.find({ userId }).select("productId rating comment").lean();

    const updatedOrders = orders.map(order => {
      const items = order.items.map(item => {
        const matchingReview = reviews.find(r => r.productId.toString() === item.productId.toString());
        return {
          ...item,
          isReviewed: !!matchingReview,
          userRating: matchingReview ? matchingReview.rating : null,
          userComment: matchingReview ? matchingReview.comment : null
        };
      });
      return { ...order, items };
    });

    res.status(200).json({
      msg: "Retrieved user orders",
      orders: updatedOrders,
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

    // Deduct commission or release earnings if status transitions to "Delivered"
    if (orderStatus === "Delivered" && order.orderStatus !== "Delivered") {
      // Group items by vendor
      const vendorItemsMap = {};
      for (const item of order.items) {
        const prod = await Product.findById(item.productId);
        if (prod && prod.vendorId) {
          const vIdStr = prod.vendorId.toString();
          if (!vendorItemsMap[vIdStr]) {
            vendorItemsMap[vIdStr] = [];
          }
          vendorItemsMap[vIdStr].push(item);
        }
      }

      const SystemConfig = require("../models/systemConfig");
      let priceThresholdConfig = await SystemConfig.findOne({ key: "priceThreshold" });
      let commissionUnderConfig = await SystemConfig.findOne({ key: "commissionUnderThreshold" });
      let commissionOverConfig = await SystemConfig.findOne({ key: "commissionOverThreshold" });

      const priceThreshold = priceThresholdConfig ? Number(priceThresholdConfig.value) : 50000;
      const commPctUnder = commissionUnderConfig ? Number(commissionUnderConfig.value) : 2;
      const commPctOver = commissionOverConfig ? Number(commissionOverConfig.value) : 5;

      const isCOD = order.paymentMethod === "COD";

      // Process commission deduction or earnings release for each vendor
      for (const [vendorId, vendorItems] of Object.entries(vendorItemsMap)) {
        const vendor = await User.findById(vendorId);
        if (vendor && vendor.role !== "admin") {
          if (isCOD) {
            // COD: Deduct commission from vendor's wallet balance
            let totalCommissionForVendor = 0;
            const itemDetails = [];

            for (const item of vendorItems) {
              const itemPrice = item.price;
              const commPct = itemPrice < priceThreshold ? commPctUnder : commPctOver;
              const itemTotal = itemPrice * item.quantity;
              const itemCommission = Math.round(itemTotal * (commPct / 100));
              totalCommissionForVendor += itemCommission;
              itemDetails.push(`${item.name || "Product"} (${commPct}%)`);
            }

            if (totalCommissionForVendor > 0) {
              vendor.walletBalance = (vendor.walletBalance || 0) - totalCommissionForVendor;
              await vendor.save();

              await WalletTransaction.create({
                vendorId,
                amount: totalCommissionForVendor,
                type: "deduction",
                description: `Commission auto-deduction for COD order #${order._id.toString().slice(-8)} items: ${itemDetails.join(", ")}`,
              });
            }
          } else {
            // Prepaid: Release vendor's earnings (total minus commission) to their wallet balance
            let totalEarningsForVendor = 0;
            const itemDetails = [];

            for (const item of vendorItems) {
              const itemPrice = item.price;
              const commPct = itemPrice < priceThreshold ? commPctUnder : commPctOver;
              const itemTotal = itemPrice * item.quantity;
              const itemCommission = Math.round(itemTotal * (commPct / 100));
              const itemEarnings = itemTotal - itemCommission;
              totalEarningsForVendor += itemEarnings;
              itemDetails.push(`${item.name || "Product"} (Earnings: ₹${itemEarnings.toLocaleString("en-IN")}, minus ${commPct}% comm)`);
            }

            if (totalEarningsForVendor > 0) {
              vendor.walletBalance = (vendor.walletBalance || 0) + totalEarningsForVendor;
              await vendor.save();

              await WalletTransaction.create({
                vendorId,
                amount: totalEarningsForVendor,
                type: "deposit",
                description: `Earnings release for prepaid order #${order._id.toString().slice(-8)} items: ${itemDetails.join("; ")}`,
              });
            }
          }
        }
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

const cancelUserOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        msg: "Order not found",
      });
    }

    // Check ownership
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        msg: "Forbidden: You are not the owner of this order",
      });
    }

    // Check if delivered
    if (order.orderStatus === "Delivered") {
      return res.status(400).json({
        msg: "Delivered orders cannot be cancelled",
      });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    res.status(200).json({
      msg: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to cancel order",
      Error: err.message,
    });
  }
};

const buyAgain = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    if (order.userId.toString() !== userId) {
      return res.status(403).json({ msg: "Forbidden: You are not the owner of this order" });
    }

    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({ msg: "Only delivered orders can be reordered" });
    }

    const added = [];
    const skipped = [];

    for (const item of order.items) {
      let maxStock = 0;
      let finalQty = item.quantity;
      let skipReason = null;
      let isPartial = false;
      let partialDetails = "";

      if (item.variantId) {
        const variant = await Variant.findOne({ _id: item.variantId, isDeleted: false });
        if (!variant) {
          skipReason = "Variant unavailable";
        } else {
          // Check product status too
          const parentProduct = await Product.findById(item.productId);
          if (!parentProduct || parentProduct.status !== "active") {
            skipReason = "Product inactive or deleted";
          } else {
            maxStock = variant.quantity || 0;
          }
        }
      } else {
        const product = await Product.findById(item.productId);
        if (!product || product.status !== "active") {
          skipReason = "Product inactive or deleted";
        } else {
          maxStock = product.quantity || 0;
        }
      }

      if (skipReason) {
        skipped.push({ name: item.name, reason: skipReason });
        continue;
      }

      if (maxStock <= 0) {
        skipped.push({ name: item.name, reason: "Out of Stock" });
        continue;
      }

      // Check for partial stock
      if (maxStock < item.quantity) {
        finalQty = maxStock;
        isPartial = true;
        partialDetails = `${item.quantity - maxStock} remaining units unavailable due to stock limits`;
      }

      // Cart merge logic
      let cartItem = await Cart.findOne({
        userId,
        productId: item.productId,
        variantId: item.variantId || null
      });

      if (cartItem) {
        if (cartItem.quantity >= maxStock) {
          skipped.push({ name: item.name, reason: "Cart already holds maximum available stock" });
        } else {
          const qtyToAdd = Math.min(finalQty, maxStock - cartItem.quantity);
          if (qtyToAdd <= 0) {
            skipped.push({ name: item.name, reason: "Cart already holds maximum available stock" });
          } else {
            cartItem.quantity += qtyToAdd;
            await cartItem.save();
            added.push({
              name: item.name,
              quantity: qtyToAdd,
              isPartial: isPartial || (qtyToAdd < finalQty),
              details: isPartial ? partialDetails : ""
            });
          }
        }
      } else {
        await Cart.create({
          userId,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: finalQty
        });
        added.push({
          name: item.name,
          quantity: finalQty,
          isPartial,
          details: partialDetails
        });
      }
    }

    res.status(200).json({
      msg: "Buy again processed successfully",
      addedCount: added.length,
      skippedCount: skipped.length,
      added,
      skipped
    });

  } catch (err) {
    res.status(500).json({
      msg: "Unable to process buy again order",
      Error: err.message
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  cancelUserOrder,
  buyAgain,
};
