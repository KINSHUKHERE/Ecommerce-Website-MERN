const express = require("express");
const router = express.Router();
const {
  postContactDetails,
  getContactDetails,
} = require("../controllers/contactController");

router.post("/post-contactdetails", postContactDetails);
router.get("/get-contactdetails", getContactDetails);

module.exports = router;
