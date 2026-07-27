const User = require("../models/authDetails");

// Verify admin against the LIVE database role, not the (possibly stale) JWT
// claim — so a demoted admin loses access immediately instead of at token expiry.
const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        msg: "Forbidden: Admin access required",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ msg: "Authorization error" });
  }
};

module.exports = verifyAdmin;
