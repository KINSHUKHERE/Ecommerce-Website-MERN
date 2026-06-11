const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  imgUrl: String,
  brandName: String,
  heading: String,
  price: Number,
  description: String,
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
