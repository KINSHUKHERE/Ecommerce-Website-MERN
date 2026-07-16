const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const verifyUser = require("../middleware/verifyUser");
const verifyVendorOrAdmin = require("../middleware/verifyVendorOrAdmin");

router.get("/dashboard/stats", verifyUser, verifyVendorOrAdmin, getDashboardStats);

module.exports = router;
