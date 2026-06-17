const express = require("express");
const Product = require("./models/productsData");
const Contact = require("./models/contactDetails");
const User = require("./models/authDetails");
const app = express();
const cors = require("cors");
const bcrypt = require("bcryptjs");

app.use(cors());
app.use(express.json());

app.post("/product-data-send", async (req, res) => {
  try {
    const products = await Product.create(req.body);

    res.status(201).json({
      msg: "Data sent successfully",
      products,
    });
  } catch (err) {
    console.log("Product details enter karne me error hai");
    res.status(401).json({
      msg: "DProduct details enter karne me error hai",
      error: err.message,
    });
  }
});

app.get("/get-product-data", async (req, res) => {
  try {
    const data = await Product.find();
    console.log("data fetched");
    res.status(200).json({
      msg: "Data fetched",
      data,
    });
  } catch (err) {
    res.status(401).json({
      msg: "Unable to get data",
      Error: err.message,
    });
  }
});

app.post("/post-contactdetails", async (req, res) => {
  try {
    const contacts = await Contact.create(req.body);

    res.status(201).json({
      message: "Data sent successfully",
      contacts,
    });
  } catch (err) {
    console.log("Error while post the contact details");
    res.send(500).json({
      message: "Error while post the contact details: ",
    });
  }
});

app.get("/get-contactdetails", async (req, res) => {
  try {
    const contacts = await Contact.find();
    console.log("Contact details fetched");
    res.status(200).json({
      msg: "Contact Detais fetched",
      contacts,
    });
  } catch (err) {
    console.log("Unable to getch contact details from db");
    res.status(401).json({
      message: "Unable to getch contact details from db",
      err,
    });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { name, role, phoneNumber, email, password } = req.body;
    const existUser = await User.findOne({ email });
    console.log(existUser)
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
});

app.post("/login", async (req, res) => {
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
});

app.get("/all-users", async (req, res) => {
  const users = await User.find();

  console.log(users);

  res.json(users);
});

module.exports = app;
