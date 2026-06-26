const express = require("express");
const router = express.Router();
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/addressController");
const verifyUser = require("../middleware/verifyUser");

router.get("/get-addresses", verifyUser, getAddresses);
router.post("/add-address", verifyUser, addAddress);
router.put("/update-address/:addressId", verifyUser, updateAddress);
router.delete("/delete-address/:addressId", verifyUser, deleteAddress);

module.exports = router;
