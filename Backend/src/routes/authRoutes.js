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
} = require("../controllers/authController");
const verifyUser = require("../middleware/verifyUser");

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.get("/all-users", getAllUsers);
router.get("/user-profile", verifyUser, getUserProfile);
router.put("/update-profile", verifyUser, updateProfile);
router.put("/complete-profile", verifyUser, completeProfile);
router.post("/become-seller", verifyUser, becomeSeller);

module.exports = router;
