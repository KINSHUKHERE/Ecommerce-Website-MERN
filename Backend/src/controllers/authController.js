const User = require("../models/authDetails");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signup = async (req, res) => {
  try {
    const { name, role, phoneNumber, email, password, avatar, businessName, businessAddress, gstin } = req.body;
    const existUser = await User.findOne({ email });
    console.log(existUser);
    if (existUser) {
      return res.status(409).json({
        msg: "User already Exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const isVendor = role === "vendor";

    const data = await User.create({
      name,
      role,
      phoneNumber,
      email,
      password: hashPassword,
      isProfileComplete: true,
      avatar: avatar || "",
      businessName: isVendor ? businessName : "",
      businessAddress: isVendor ? businessAddress : "",
      gstin: isVendor ? gstin : "",
      vendorStatus: isVendor ? "pending" : "active",
    });
    res.status(201).json({
      msg: "User Created",
      data,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error while signup",
      Error: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        msg: "Email is not registered. Please sign up first!",
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        msg: "Your account has been suspended by the administrator.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        msg: "Incorrect password. Please try again!",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      msg: "Login successful",
      user,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Unable to login. Please signup!",
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { name, email } = payload;

    let user = await User.findOne({ email });

    if (user && user.isSuspended) {
      return res.status(403).json({
        msg: "Your account has been suspended by the administrator.",
      });
    }

    if (!user) {
      user = await User.create({
        name,
        email,
        phoneNumber: "",
        password: "",
        role: "user",
        provider: "google",
        isProfileComplete: false,
      });
    }

    const jwtToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      msg: "Google Login Successful",
      token: jwtToken,
      user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      msg: "Google Login Failed",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    res.json(users);
  } catch (err) {
    res.status(500).json({
      msg: "Unable to fetch users",
      Error: err.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const userObj = user.toObject();
    userObj.hasPassword = !!(user.password && user.password.trim() !== "");
    delete userObj.password;

    res.status(200).json(userObj);
  } catch (error) {
    res.status(500).json({
      msg: "Unable to fetch profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, password, avatar } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (name) {
      user.name = name;
    }

    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }

    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    if (user.role === "vendor") {
      const { businessName, businessAddress, gstin } = req.body;
      if (businessName) user.businessName = businessName;
      if (businessAddress) user.businessAddress = businessAddress;
      if (gstin) user.gstin = gstin;
    }

    await user.save();

    res.status(200).json({
      msg: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        businessName: user.businessName,
        businessAddress: user.businessAddress,
        gstin: user.gstin,
      },
    });
  } catch (err) {
    res.status(500).json({
      msg: "Failed to update profile",
      Error: err.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");

    res.status(200).json({
      msg: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      msg: "Unable to logout",
    });
  }
};

const completeProfile = async (req, res) => {
  try {
    const { phoneNumber, password, avatar } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        msg: "Phone number is required",
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    user.phoneNumber = phoneNumber;
    user.isProfileComplete = true;

    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    const userObj = user.toObject();
    userObj.hasPassword = !!(user.password && user.password.trim() !== "");
    delete userObj.password;

    res.status(200).json({
      msg: "Profile completed successfully",
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Failed to complete profile",
      Error: err.message,
    });
  }
};

const becomeSeller = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { businessName, businessAddress, gstin } = req.body;

    if (!businessName || !businessAddress || !gstin) {
      return res.status(400).json({ msg: "Please fill in all seller details." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.role = "vendor";
    user.businessName = businessName;
    user.businessAddress = businessAddress;
    user.gstin = gstin;
    user.isProfileComplete = true;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      msg: "Congratulations! You are now a registered seller.",
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Failed to become a seller",
      Error: err.message,
    });
  }
};

const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).sort({ createdAt: -1 });
    res.status(200).json({ vendors });
  } catch (err) {
    res.status(500).json({ msg: "Failed to retrieve vendors", Error: err.message });
  }
};

const updateVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { vendorStatus } = req.body;

    if (!["active", "pending", "suspended"].includes(vendorStatus)) {
      return res.status(400).json({ msg: "Invalid vendor status value." });
    }

    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ msg: "Vendor not found." });
    }

    vendor.vendorStatus = vendorStatus;
    await vendor.save();

    res.status(200).json({ msg: `Vendor status updated to ${vendorStatus}.`, vendor });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update vendor status.", Error: err.message });
  }
};

const createVendorManually = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, businessName, businessAddress, gstin } = req.body;
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(409).json({ msg: "User already exists with this email." });
    }

    const hashPassword = await bcrypt.hash(password || "Vendor@123", 10);
    const data = await User.create({
      name,
      role: "vendor",
      phoneNumber,
      email,
      password: hashPassword,
      isProfileComplete: true,
      businessName,
      businessAddress,
      gstin,
      vendorStatus: "active",
    });

    res.status(201).json({ msg: "Vendor created successfully", data });
  } catch (err) {
    res.status(500).json({ msg: "Failed to create vendor", Error: err.message });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ msg: "Vendor not found." });
    }

    const Product = require("../models/productsData");
    const Variant = require("../models/variantDetails");
    const vendorProducts = await Product.find({ vendorId });
    const productIds = vendorProducts.map(p => p._id);
    
    await Product.deleteMany({ vendorId });
    await Variant.deleteMany({ productId: { $in: productIds } });

    await User.findByIdAndDelete(vendorId);
    res.status(200).json({ msg: "Vendor deleted successfully from database." });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete vendor", Error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    if (user.role === "vendor") {
      const Product = require("../models/productsData");
      const Variant = require("../models/variantDetails");
      const vendorProducts = await Product.find({ vendorId: userId });
      const productIds = vendorProducts.map(p => p._id);
      
      await Product.deleteMany({ vendorId: userId });
      await Variant.deleteMany({ productId: { $in: productIds } });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ msg: "User account deleted successfully from database." });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete user", Error: err.message });
  }
};

const toggleUserSuspension = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      msg: `User account status updated to ${user.isSuspended ? "suspended" : "active"}.`,
      user,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update user suspension status", Error: err.message });
  }
};

const getPublicVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await User.findOne({ _id: vendorId, role: "vendor" })
      .select("name email businessName gstin businessAddress phoneNumber createdAt vendorStatus");
    
    if (!vendor) {
      return res.status(404).json({ msg: "Vendor profile not found" });
    }
    
    res.status(200).json({ vendor });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

module.exports = {
  signup,
  login,
  googleLogin,
  logout,
  getAllUsers,
  getUserProfile,
  updateProfile,
  completeProfile,
  becomeSeller,
  getVendors,
  updateVendorStatus,
  createVendorManually,
  deleteVendor,
  deleteUser,
  toggleUserSuspension,
  getPublicVendor,
};

