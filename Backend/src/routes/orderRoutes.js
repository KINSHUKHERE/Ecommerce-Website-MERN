const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  cancelUserOrder,
} = require("../controllers/orderController");
const verifyUser = require("../middleware/verifyUser");
const verifyVendorOrAdmin = require("../middleware/verifyVendorOrAdmin");

router.post("/orders", verifyUser, createOrder);
router.get("/orders", verifyUser, verifyVendorOrAdmin, getAllOrders);
router.get("/orders/user", verifyUser, getUserOrders);
router.put("/orders/:orderId", verifyUser, verifyVendorOrAdmin, updateOrderStatus);
router.put("/orders/:orderId/cancel", verifyUser, cancelUserOrder);

module.exports = router;
