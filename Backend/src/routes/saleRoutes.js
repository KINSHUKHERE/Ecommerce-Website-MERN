const express = require("express");
const router = express.Router();
const { getSaleConfig, updateSaleConfig } = require("../controllers/saleController");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

router.get("/sale-config", getSaleConfig);
router.post("/sale-config", verifyUser, verifyAdmin, updateSaleConfig);

module.exports = router;
