const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/orderDetails");
const Cart = require("../models/cartDetails");

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

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
