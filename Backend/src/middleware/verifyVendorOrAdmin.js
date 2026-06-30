const User = require("../models/authDetails");

const verifyVendorOrAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role !== "admin" && user.role !== "vendor") {
      return res.status(403).json({
        msg: "Forbidden: Vendor or Admin access required",
      });
    }

    if (user.role === "vendor" && user.vendorStatus !== "active") {
      return res.status(403).json({
        msg: "Forbidden: Your seller account is pending approval or suspended.",
        vendorStatus: user.vendorStatus,
      });
    }

    // Attach latest info to req.user
    req.user.vendorStatus = user.vendorStatus;
    next();
  } catch (err) {
    res.status(500).json({ msg: "Authentication error", error: err.message });
  }
};

module.exports = verifyVendorOrAdmin;
