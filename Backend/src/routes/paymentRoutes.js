const express = require("express");
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment } = require("../controllers/paymentController");
const verifyUser = require("../middleware/verifyUser");

router.post("/payment/create-razorpay-order", verifyUser, createRazorpayOrder);
router.post("/payment/verify-razorpay-payment", verifyUser, verifyRazorpayPayment);

module.exports = router;
