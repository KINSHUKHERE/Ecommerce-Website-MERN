const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

router.post("/orders", createOrder);
router.get("/orders", getAllOrders);
router.get("/orders/user/:userId", getUserOrders);
router.put("/orders/:orderId", updateOrderStatus);

module.exports = router;
