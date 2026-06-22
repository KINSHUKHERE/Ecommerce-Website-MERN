const express = require("express");
const router = express.Router();
const { signup, login, getAllUsers, getUserProfile, updateProfile } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/all-users", getAllUsers);
router.get("/user-profile/:id", getUserProfile);
router.put("/update-profile/:id", updateProfile);

module.exports = router;
