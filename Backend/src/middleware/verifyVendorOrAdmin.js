const verifyVendorOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "vendor")) {
    return res.status(403).json({
      msg: "Forbidden: Vendor or Admin access required",
    });
  }
  next();
};

module.exports = verifyVendorOrAdmin;
