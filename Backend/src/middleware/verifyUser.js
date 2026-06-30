const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {
  try {
    console.log("verifyUser: Cookies received:", req.cookies);
    console.log("verifyUser: Authorization header:", req.headers.authorization);
    
    let token = req.cookies.token;

    // Fallback to Authorization header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts[0] === "Bearer" && parts[1]) {
        token = parts[1];
        console.log("verifyUser: Token extracted from Authorization header");
      }
    }

    if (!token) {
      console.log("verifyUser: No token found in cookies or Authorization header");
      return res.status(401).json({
        msg: "Unauthorized",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("verifyUser: Token decoded successfully:", decoded);
    
    const User = require("../models/authDetails");
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }
    if (user.isSuspended) {
      return res.status(403).json({ msg: "Your account has been suspended by the administrator." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("verifyUser: Error verifying token:", error.message);
    return res.status(401).json({
      msg: "Invalid Token",
    });
  }
};

module.exports = verifyUser;