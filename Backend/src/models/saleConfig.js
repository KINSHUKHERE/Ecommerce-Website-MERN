const mongoose = require("mongoose");

const saleConfigSchema = new mongoose.Schema(
  {
    isGlobalSaleActive: {
      type: Boolean,
      default: false,
    },
    saleName: {
      type: String,
      default: "Festive Season Sale",
    },
    saleTheme: {
      type: String,
      default: "normal",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SaleConfig", saleConfigSchema);
