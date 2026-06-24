const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/orders", verifyUser, createOrder);
router.get("/orders", verifyUser, verifyAdmin, getAllOrders);
router.get("/orders/user", verifyUser, getUserOrders);
router.put("/orders/:orderId", verifyUser, verifyAdmin, updateOrderStatus);

module.exports = router;
