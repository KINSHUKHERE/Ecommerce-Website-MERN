const Product = require("../models/productsData");

const addProduct = async (req, res) => {
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
};

const getProducts = async (req, res) => {
  try {
    const data = await Product.find()
      .populate("categoryId")
      .populate("brandId");
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
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.status(200).json({
      msg: "Product deleted successfully",
      deletedProduct,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error deleting product",
      error: err.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.status(200).json({
      msg: "Product updated successfully",
      updatedProduct,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error updating product",
      error: err.message,
    });
  }
};

module.exports = {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
};
