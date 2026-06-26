const Address = require("../models/addressDetails");

// Fetch saved addresses for user
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({ success: false, msg: "Failed to fetch addresses" });
  }
};

// Add a new address (Limit max 10)
exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { streetAddress, city, state, pinCode, country } = req.body;

    if (!streetAddress || !city || !state || !pinCode) {
      return res.status(400).json({ success: false, msg: "Please fill all required fields" });
    }

    // Enforce 10 address limit
    const addressCount = await Address.countDocuments({ userId });
    if (addressCount >= 10) {
      return res.status(400).json({ success: false, msg: "You can save up to 10 addresses only." });
    }

    const newAddress = await Address.create({
      userId,
      streetAddress,
      city,
      state,
      pinCode,
      country: country || "India",
    });

    return res.status(201).json({ success: true, msg: "Address saved successfully", address: newAddress });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({ success: false, msg: "Failed to save address" });
  }
};

// Update existing address
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;
    const { streetAddress, city, state, pinCode, country } = req.body;

    if (!streetAddress || !city || !state || !pinCode) {
      return res.status(400).json({ success: false, msg: "Please fill all required fields" });
    }

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ success: false, msg: "Address not found" });
    }

    address.streetAddress = streetAddress;
    address.city = city;
    address.state = state;
    address.pinCode = pinCode;
    address.country = country || "India";

    await address.save();

    return res.status(200).json({ success: true, msg: "Address updated successfully", address });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({ success: false, msg: "Failed to update address" });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    const address = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ success: false, msg: "Address not found" });
    }

    return res.status(200).json({ success: true, msg: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({ success: false, msg: "Failed to delete address" });
  }
};
