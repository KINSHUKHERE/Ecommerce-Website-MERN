const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    imgUrl: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    heading: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: false,
    },

    description: {
      type: String,
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    quantity: {
      type: Number,
      required: false,
      default: 0,
    },

    options: [
      {
        name: { type: String, required: true },
        values: { type: [String], default: [] },
      }
    ],

    sold: {
      type: Boolean,
      default: false,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },

    onSale: {
      type: Boolean,
      default: false,
    },

    salePrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;