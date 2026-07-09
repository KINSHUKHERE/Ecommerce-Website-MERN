const express = require("express");
const verifyUser = require("../middleware/verifyUser");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/notifications", verifyUser, getNotifications);
router.put("/notifications/read-all", verifyUser, markAllAsRead);
router.put("/notifications/:id/read", verifyUser, markAsRead);
router.delete("/notifications/:id", verifyUser, deleteNotification);

module.exports = router;
