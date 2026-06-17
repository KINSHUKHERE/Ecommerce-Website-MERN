const express = require("express");
const Product = require("./models/productsData");
const Contact = require("./models/contactDetails");
const app = express();
const cors = require("cors");

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

module.exports = app;
