const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createVendorRechargeOrder,
  verifyVendorRechargePayment,
  getVendorWalletStatus,
  getAdminVendorWalletStatus,
  getCommissionSettings,
  updateCommissionSettings,
} = require("../controllers/paymentController");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/payment/create-razorpay-order", verifyUser, createRazorpayOrder);
router.post("/payment/verify-razorpay-payment", verifyUser, verifyRazorpayPayment);

// Vendor Wallet Routes
router.post("/payment/vendor/create-recharge-order", verifyUser, createVendorRechargeOrder);
router.post("/payment/vendor/verify-recharge-payment", verifyUser, verifyVendorRechargePayment);
router.get("/payment/vendor/wallet-status", verifyUser, getVendorWalletStatus);

// Admin-only Vendor Wallet Status
router.get("/payment/admin/vendor-wallet-status/:vendorId", verifyUser, verifyAdmin, getAdminVendorWalletStatus);

// Commission Settings Routes
router.get("/payment/commission-settings", verifyUser, getCommissionSettings);
router.post("/payment/commission-settings", verifyUser, verifyAdmin, updateCommissionSettings);

module.exports = router;
