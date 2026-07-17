const mongoose = require("mongoose");

const bulkActionLogSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["price", "stock", "publish", "unpublish", "sale_price", "delete"],
    },
    operation: {
      type: String,
      required: false,
    },
    productsCount: {
      type: Number,
      required: true,
    },
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BulkActionLog", bulkActionLogSchema);
