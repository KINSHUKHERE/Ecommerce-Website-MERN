const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderDetails");
const Cart = require("../models/cartDetails");
const User = require("../models/authDetails");
const WalletTransaction = require("../models/walletTransaction");
const { getVendorLifetimeSales, getRequiredMinimumBalance } = require("../utils/walletHelper");
const {
  computeOrderTotals,
  reserveStock,
  releaseStock,
  createOrderNotifications,
} = require("../utils/orderHelper");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Step 1: Create a Razorpay order
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees from frontend

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid order amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return res.status(500).json({ msg: "Failed to initiate payment. Please try again." });
  }
};

// Step 2: Verify Razorpay signature and create DB order
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderData,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderData) {
      return res.status(400).json({ msg: "Missing payment verification fields" });
    }

    // Verify HMAC SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Payment verification failed. Signature mismatch." });
    }

    const userId = req.user.userId;

    // Recompute the order authoritatively from the DB — the client's prices/totals
    // are never trusted. This is what an item/price is actually worth server-side.
    let totals;
    try {
      totals = await computeOrderTotals(orderData.items);
    } catch (priceErr) {
      return res.status(priceErr.statusCode || 400).json({ msg: priceErr.message });
    }

    // Cross-check what was actually paid against what the order is worth. The
    // signature only proves the (order_id, payment_id) pair is authentic; it says
    // nothing about the amount. Fetch the real Razorpay order and compare.
    const paidOrder = await razorpay.orders.fetch(razorpay_order_id);
    const expectedPaise = Math.round(totals.expectedTotal * 100);
    const paidPaise = Number(paidOrder.amount);

    // Allow ₹1 of float slack; block any real tampering.
    if (Math.abs(paidPaise - expectedPaise) > 100) {
      return res.status(400).json({
        msg: "Payment amount does not match the order total. Order rejected.",
      });
    }

    // Reserve stock atomically (prevents overselling under concurrency).
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
        shippingAddress: orderData.shippingAddress,
        paymentMethod: "Razorpay",
        transactionId: razorpay_payment_id,
        paymentStatus: "Paid",
        orderStatus: "Processing",
      });
    } catch (createErr) {
      // Roll back the reserved stock if we couldn't persist the order.
      await releaseStock(totals.pricedItems);
      throw createErr;
    }

    // Clear the user's cart
    await Cart.deleteMany({ userId });

    await createOrderNotifications(newOrder, totals.pricedItems);

    return res.status(201).json({
      msg: "Payment verified and order placed successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("Razorpay payment verification failed:", err.message);
    return res.status(500).json({ msg: "Order creation failed after payment. Contact support." });
  }
};

// Vendor Wallet: Create Razorpay recharge order
const createVendorRechargeOrder = async (req, res) => {
  try {
    const { amount } = req.body; // in rupees
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid recharge amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: `recharge_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay recharge order creation failed:", err);
    return res.status(500).json({ msg: "Failed to initiate recharge order. Please try again." });
  }
};

// Vendor Wallet: Verify Razorpay recharge payment
const verifyVendorRechargePayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !amount) {
      return res.status(400).json({ msg: "Missing recharge verification fields" });
    }

    // Support simulated payment bypass ONLY in non-production (dev/testing).
    // In production this branch is disabled so a vendor cannot credit their
    // wallet for free with hard-coded sentinel values.
    if (
      process.env.NODE_ENV !== "production" &&
      razorpay_payment_id === "simulated_payment" &&
      razorpay_signature === "simulated_signature"
    ) {
      const vendorId = req.user.userId;
      const vendor = await User.findById(vendorId);
      if (!vendor) {
        return res.status(404).json({ msg: "Vendor not found" });
      }

      vendor.walletBalance = (vendor.walletBalance || 0) + Number(amount);
      await vendor.save();

      const transaction = await WalletTransaction.create({
        vendorId,
        amount: Number(amount),
        type: "deposit",
        description: `Wallet recharge of ₹${amount} (Simulated Sandbox)`,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });

      return res.status(200).json({
        msg: "Wallet recharged successfully (Simulated)",
        walletBalance: vendor.walletBalance,
        transaction,
      });
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Recharge verification failed. Signature mismatch." });
    }

    // Recharge verified — Update vendor's wallet balance
    const vendorId = req.user.userId;
    const vendor = await User.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    vendor.walletBalance = (vendor.walletBalance || 0) + Number(amount);
    await vendor.save();

    // Create deposit transaction log
    const transaction = await WalletTransaction.create({
      vendorId,
      amount: Number(amount),
      type: "deposit",
      description: `Wallet recharge of ₹${amount} via Razorpay`,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    return res.status(200).json({
      msg: "Wallet recharged successfully",
      walletBalance: vendor.walletBalance,
      transaction,
    });
  } catch (err) {
    console.error("Razorpay recharge verification failed:", err);
    return res.status(500).json({ msg: "Recharge verification failed. Contact support." });
  }
};

// Vendor Wallet: Get wallet stats and logs
const getVendorWalletStatus = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const vendor = await User.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    const lifetimeSales = await getVendorLifetimeSales(vendorId);
    const requiredMinBalance = await getRequiredMinimumBalance(lifetimeSales, vendor);
    const transactions = await WalletTransaction.find({ vendorId }).sort({ createdAt: -1 });

    return res.status(200).json({
      walletBalance: vendor.walletBalance || 0,
      lifetimeSales,
      requiredMinBalance,
      transactions,
    });
  } catch (err) {
    console.error("Error fetching vendor wallet status:", err);
    return res.status(500).json({ msg: "Failed to fetch wallet status" });
  }
};

// Admin: Get specific vendor wallet stats and logs
const getAdminVendorWalletStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await User.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ msg: "Vendor not found" });
    }

    const lifetimeSales = await getVendorLifetimeSales(vendorId);
    const requiredMinBalance = await getRequiredMinimumBalance(lifetimeSales, vendor);
    const transactions = await WalletTransaction.find({ vendorId }).sort({ createdAt: -1 });

    return res.status(200).json({
      walletBalance: vendor.walletBalance || 0,
      lifetimeSales,
      requiredMinBalance,
      transactions,
    });
  } catch (err) {
    console.error("Error fetching admin vendor wallet status:", err);
    return res.status(500).json({ msg: "Failed to fetch vendor wallet status" });
  }
};

const SystemConfig = require("../models/systemConfig");

// Fetch global commission settings
const getCommissionSettings = async (req, res) => {
  try {
    let priceThresholdConfig = await SystemConfig.findOne({ key: "priceThreshold" });
    let commissionUnderConfig = await SystemConfig.findOne({ key: "commissionUnderThreshold" });
    let commissionOverConfig = await SystemConfig.findOne({ key: "commissionOverThreshold" });
    let minWalletConfig = await SystemConfig.findOne({ key: "minimumWalletBalance" });

    // Return defaults if not set yet
    const priceThreshold = priceThresholdConfig ? Number(priceThresholdConfig.value) : 50000;
    const commissionUnderThreshold = commissionUnderConfig ? Number(commissionUnderConfig.value) : 2;
    const commissionOverThreshold = commissionOverConfig ? Number(commissionOverConfig.value) : 5;
    const minimumWalletBalance = minWalletConfig ? Number(minWalletConfig.value) : 200;

    return res.status(200).json({
      priceThreshold,
      commissionUnderThreshold,
      commissionOverThreshold,
      minimumWalletBalance,
    });
  } catch (err) {
    console.error("Error retrieving commission settings:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Update global commission settings (Admin only)
const updateCommissionSettings = async (req, res) => {
  try {
    const { priceThreshold, commissionUnderThreshold, commissionOverThreshold, minimumWalletBalance } = req.body;

    if (priceThreshold !== undefined) {
      await SystemConfig.findOneAndUpdate(
        { key: "priceThreshold" },
        { value: Number(priceThreshold) },
        { upsert: true, new: true }
      );
    }
    if (commissionUnderThreshold !== undefined) {
      await SystemConfig.findOneAndUpdate(
        { key: "commissionUnderThreshold" },
        { value: Number(commissionUnderThreshold) },
        { upsert: true, new: true }
      );
    }
    if (commissionOverThreshold !== undefined) {
      await SystemConfig.findOneAndUpdate(
        { key: "commissionOverThreshold" },
        { value: Number(commissionOverThreshold) },
        { upsert: true, new: true }
      );
    }
    if (minimumWalletBalance !== undefined) {
      await SystemConfig.findOneAndUpdate(
        { key: "minimumWalletBalance" },
        { value: Number(minimumWalletBalance) },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({
      msg: "Marketplace settings updated successfully",
      priceThreshold: priceThreshold !== undefined ? Number(priceThreshold) : undefined,
      commissionUnderThreshold: commissionUnderThreshold !== undefined ? Number(commissionUnderThreshold) : undefined,
      commissionOverThreshold: commissionOverThreshold !== undefined ? Number(commissionOverThreshold) : undefined,
      minimumWalletBalance: minimumWalletBalance !== undefined ? Number(minimumWalletBalance) : undefined,
    });
  } catch (err) {
    console.error("Error updating commission settings:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createVendorRechargeOrder,
  verifyVendorRechargePayment,
  getVendorWalletStatus,
  getAdminVendorWalletStatus,
  getCommissionSettings,
  updateCommissionSettings,
};
