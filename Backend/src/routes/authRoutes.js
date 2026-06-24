const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  getAllUsers,
  getUserProfile,
  updateProfile,
} = require("../controllers/authController");
const verifyUser = require("../middleware/verifyUser");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/all-users", getAllUsers);
router.get("/user-profile", verifyUser, getUserProfile);
router.put("/update-profile", verifyUser, updateProfile);

module.exports = router;
