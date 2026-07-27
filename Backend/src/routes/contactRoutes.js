const express = require("express");
const router = express.Router();
const {
  postContactDetails,
  getContactDetails,
} = require("../controllers/contactController");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/post-contactdetails", postContactDetails);
// Customer enquiries contain PII — admin-only.
router.get("/get-contactdetails", verifyUser, verifyAdmin, getContactDetails);

module.exports = router;
