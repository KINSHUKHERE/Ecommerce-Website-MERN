const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    attributes: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    barcode: {
      type: String,
      sparse: true,
    },
    weight: {
      type: Number,
      default: 0,
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create index for fast dynamic options matching
variantSchema.index({ productId: 1, "attributes.name": 1, "attributes.value": 1 });

const Variant = mongoose.model("Variant", variantSchema);

module.exports = Variant;
