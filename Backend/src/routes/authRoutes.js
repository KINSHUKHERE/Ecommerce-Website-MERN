const express = require("express");
const router = express.Router();
const { signup, login, getAllUsers } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/all-users", getAllUsers);

module.exports = router;
