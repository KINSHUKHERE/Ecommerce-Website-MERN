const express = require("express");
const Product = require("./models/productsData");
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
    res.status(400).json({
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

module.exports = app;
