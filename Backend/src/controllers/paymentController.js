const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderDetails");
const Cart = require("../models/cartDetails");
const User = require("../models/authDetails");
const WalletTransaction = require("../models/walletTransaction");
const { getVendorLifetimeSales, getRequiredMinimumBalance } = require("../utils/walletHelper");

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

    // Signature verified — create the order in DB
    const userId = req.user.userId;

    const newOrder = await Order.create({
      userId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: "Razorpay",
      transactionId: razorpay_payment_id,
      paymentStatus: "Paid",
      orderStatus: "Processing",
    });

    // Clear the user's cart
    await Cart.findOneAndDelete({ userId });
    
    return res.status(201).json({
      msg: "Payment verified and order placed successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("Razorpay payment verification failed:", err);
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
    const requiredMinBalance = getRequiredMinimumBalance(lifetimeSales);
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
    const requiredMinBalance = getRequiredMinimumBalance(lifetimeSales);
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

    // Return defaults if not set yet
    const priceThreshold = priceThresholdConfig ? Number(priceThresholdConfig.value) : 50000;
    const commissionUnderThreshold = commissionUnderConfig ? Number(commissionUnderConfig.value) : 2;
    const commissionOverThreshold = commissionOverConfig ? Number(commissionOverConfig.value) : 5;

    return res.status(200).json({
      priceThreshold,
      commissionUnderThreshold,
      commissionOverThreshold,
    });
  } catch (err) {
    console.error("Error retrieving commission settings:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Update global commission settings (Admin only)
const updateCommissionSettings = async (req, res) => {
  try {
    const { priceThreshold, commissionUnderThreshold, commissionOverThreshold } = req.body;

    if (priceThreshold === undefined || commissionUnderThreshold === undefined || commissionOverThreshold === undefined) {
      return res.status(400).json({ msg: "Missing required config parameters" });
    }

    await SystemConfig.findOneAndUpdate(
      { key: "priceThreshold" },
      { value: Number(priceThreshold) },
      { upsert: true, new: true }
    );
    await SystemConfig.findOneAndUpdate(
      { key: "commissionUnderThreshold" },
      { value: Number(commissionUnderThreshold) },
      { upsert: true, new: true }
    );
    await SystemConfig.findOneAndUpdate(
      { key: "commissionOverThreshold" },
      { value: Number(commissionOverThreshold) },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      msg: "Marketplace commission settings updated successfully",
      priceThreshold,
      commissionUnderThreshold,
      commissionOverThreshold,
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
