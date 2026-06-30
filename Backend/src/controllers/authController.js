const User = require("../models/authDetails");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signup = async (req, res) => {
  try {
    const { name, role, phoneNumber, email, password, avatar } = req.body;
    const existUser = await User.findOne({ email });
    console.log(existUser);
    if (existUser) {
      return res.status(409).json({
        msg: "User already Exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const data = await User.create({
      name,
      role,
      phoneNumber,
      email,
      password: hashPassword,
      isProfileComplete: true,
      avatar: avatar || "",
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
};

