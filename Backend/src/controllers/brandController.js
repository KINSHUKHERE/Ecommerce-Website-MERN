const Brand = require("../models/brandDetails");

const addBrand = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp("^" + name.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
      categoryId,
      isDeleted: false,
    });

    if (existingBrand) {
      return res.status(409).json({
        msg: "Brand already exists in this category",
      });
    }

    const brand = await Brand.create({
      name: name.trim(),
      categoryId,
    });

    res.status(201).json({
      msg: "Brand created successfully",
      brand,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to create brand",
      error: err.message,
    });
  }
};

const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({
      isDeleted: false,
    }).populate("categoryId");

    res.status(200).json({
      msg: "Brands fetched successfully",
      brands,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to fetch brands",
      error: err.message,
    });
  }
};

const getBrandsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const brands = await Brand.find({
      categoryId,
      isDeleted: false,
      isActive: true,
    });

    res.status(200).json({
      msg: "Brands fetched successfully",
      brands,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to fetch brands",
      error: err.message,
    });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const { name } = req.body;

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({
        msg: "Brand not found",
      });
    }

    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp("^" + name.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") },
      categoryId: brand.categoryId,
      isDeleted: false,
      _id: { $ne: brandId }
    });

    if (existingBrand) {
      return res.status(409).json({
        msg: "Brand already exists in this category",
      });
    }

    brand.name = name.trim();
    const updatedBrand = await brand.save();

    res.status(200).json({
      msg: "Brand updated successfully",
      updatedBrand,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to update brand",
      error: err.message,
    });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const deletedBrand = await Brand.findByIdAndDelete(
      req.params.id
    );

    if (!deletedBrand) {
      return res.status(404).json({
        msg: "Brand not found",
      });
    }

    res.status(200).json({
      msg: "Brand deleted successfully",
      deletedBrand,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to delete brand",
      error: err.message,
    });
  }
};

const toggleBrandStatus = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        msg: "Brand not found",
      });
    }

    brand.isActive = !brand.isActive;

    await brand.save();

    res.status(200).json({
      msg: "Brand status updated",
      brand,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to update brand status",
      error: err.message,
    });
  }
};

module.exports = {
  addBrand,
  getBrands,
  getBrandsByCategory,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
};
