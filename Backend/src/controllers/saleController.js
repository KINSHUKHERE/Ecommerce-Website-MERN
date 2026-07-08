const SaleConfig = require("../models/saleConfig");

const getSaleConfig = async (req, res) => {
  try {
    let config = await SaleConfig.findOne();
    if (!config) {
      config = await SaleConfig.create({
        isGlobalSaleActive: false,
        saleName: "Festive Season Sale",
        saleTheme: "normal",
      });
    }
    res.status(200).json({
      msg: "Retrieved sale config successfully",
      config,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to retrieve sale config",
      Error: err.message,
    });
  }
};

const updateSaleConfig = async (req, res) => {
  try {
    const { isGlobalSaleActive, saleName, saleTheme } = req.body;

    let config = await SaleConfig.findOne();
    if (!config) {
      config = new SaleConfig();
    }

    if (typeof isGlobalSaleActive !== "undefined") {
      config.isGlobalSaleActive = isGlobalSaleActive;
    }
    if (saleName) {
      config.saleName = saleName;
    }
    if (saleTheme) {
      config.saleTheme = saleTheme;
    }

    await config.save();

    res.status(200).json({
      msg: "Updated sale config successfully",
      config,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to update sale config",
      Error: err.message,
    });
  }
};

module.exports = {
  getSaleConfig,
  updateSaleConfig,
};
