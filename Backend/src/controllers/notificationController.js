const Notification = require("../models/notificationDetails");

// Fetch notifications for active user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let query = {};
    if (role === "admin") {
      // Admins get global system notifications + explicit ones
      query = {
        $or: [{ recipient: null }, { recipient: userId }]
      };
    } else {
      // Vendors/Users get their own specific notifications
      query = { recipient: userId };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(10);

    // Prune notifications: delete any older notifications that are not in the latest 10 list
    if (notifications.length > 0) {
      const latestIds = notifications.map(n => n._id);
      await Notification.deleteMany({
        ...query,
        _id: { $nin: latestIds }
      });
    }

    res.status(200).json({
      msg: "Notifications fetched successfully",
      notifications,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to fetch notifications",
      error: err.message,
    });
  }
};

// Mark single notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    // Authorization check
    if (notification.recipient && notification.recipient.toString() !== userId) {
      return res.status(403).json({ msg: "Unauthorized to update this notification" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      msg: "Notification marked as read",
      notification,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to update notification",
      error: err.message,
    });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    let query = {};
    if (role === "admin") {
      query = {
        $or: [{ recipient: null }, { recipient: userId }],
        isRead: false
      };
    } else {
      query = { recipient: userId, isRead: false };
    }

    await Notification.updateMany(query, { $set: { isRead: true } });

    res.status(200).json({
      msg: "All notifications marked as read",
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to update notifications",
      error: err.message,
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    if (notification.recipient && notification.recipient.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized to delete this notification" });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      msg: "Notification deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to delete notification",
      error: err.message,
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
