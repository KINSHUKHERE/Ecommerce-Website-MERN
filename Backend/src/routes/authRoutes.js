const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  googleLogin,
  logout,
  getAllUsers,
  getUserProfile,
  updateProfile,
  completeProfile,
  becomeSeller,
  getVendors,
  updateVendorStatus,
  createVendorManually,
  deleteVendor,
  deleteUser,
  toggleUserSuspension,
  getPublicVendor,
} = require("../controllers/authController");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.get("/all-users", verifyUser, verifyAdmin, getAllUsers);
router.get("/user-profile", verifyUser, getUserProfile);
router.put("/update-profile", verifyUser, updateProfile);
router.put("/complete-profile", verifyUser, completeProfile);
router.post("/become-seller", verifyUser, becomeSeller);

// Admin-only Vendor Management
router.get("/vendors", verifyUser, verifyAdmin, getVendors);
router.post("/vendors", verifyUser, verifyAdmin, createVendorManually);
router.put("/vendors/:vendorId/status", verifyUser, verifyAdmin, updateVendorStatus);
router.delete("/vendors/:vendorId", verifyUser, verifyAdmin, deleteVendor);

// Admin-only User Management
router.delete("/users/:userId", verifyUser, verifyAdmin, deleteUser);
router.put("/users/:userId/suspend", verifyUser, verifyAdmin, toggleUserSuspension);

// Public Vendor Details storefront route
router.get("/vendors/public/:vendorId", getPublicVendor);

module.exports = router;
