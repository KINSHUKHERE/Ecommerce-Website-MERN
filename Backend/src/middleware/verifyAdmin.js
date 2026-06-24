const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      msg: "Forbidden: Admin access required",
    });
  }
  next();
};

module.exports = verifyAdmin;
