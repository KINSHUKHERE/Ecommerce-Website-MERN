const User = require("../models/authDetails");
const bcrypt = require("bcryptjs");

const signup = async (req, res) => {
  try {
    const { name, role, phoneNumber, email, password } = req.body;
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
      return res.status(401).json({
        msg: "Enter correct login credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        msg: "Enter correct login credentials",
      });
    }

    res.status(200).json({
      msg: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Unable to login. Please signup!",
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

module.exports = {
  signup,
  login,
  getAllUsers,
};
