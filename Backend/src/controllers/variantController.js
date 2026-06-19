const Variant = require("../models/variantDetails");

const addVariant = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    const existingVariant = await Variant.findOne({
      name: name.trim(),
      categoryId,
      isDeleted: false,
    });

    if (existingVariant) {
      return res.status(409).json({
        msg: "Variant already exists in this category",
      });
    }

    const variant = await Variant.create({
      name,
      categoryId,
    });

    res.status(201).json({
      msg: "Variant created successfully",
      variant,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to create variant",
      error: err.message,
    });
  }
};

const getVariants = async (req, res) => {
  try {
    const variants = await Variant.find({
      isDeleted: false,
    }).populate("categoryId");

    res.status(200).json({
      msg: "Variants fetched successfully",
      variants,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to fetch variants",
      error: err.message,
    });
  }
};

const getVariantsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const variants = await Variant.find({
      categoryId,
      isDeleted: false,
      isActive: true,
    });

    res.status(200).json({
      msg: "Variants fetched successfully",
      variants,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to fetch variants",
      error: err.message,
    });
  }
};

const updateVariant = async (req, res) => {
  try {
    const updatedVariant = await Variant.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      {
        new: true,
      }
    );

    if (!updatedVariant) {
      return res.status(404).json({
        msg: "Variant not found",
      });
    }

    res.status(200).json({
      msg: "Variant updated successfully",
      updatedVariant,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to update variant",
      error: err.message,
    });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const deletedVariant = await Variant.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
      },
      {
        new: true,
      }
    );

    if (!deletedVariant) {
      return res.status(404).json({
        msg: "Variant not found",
      });
    }

    res.status(200).json({
      msg: "Variant deleted successfully",
      deletedVariant,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to delete variant",
      error: err.message,
    });
  }
};

const toggleVariantStatus = async (req, res) => {
  try {
    const variant = await Variant.findById(req.params.id);

    if (!variant) {
      return res.status(404).json({
        msg: "Variant not found",
      });
    }

    variant.isActive = !variant.isActive;

    await variant.save();

    res.status(200).json({
      msg: "Variant status updated",
      variant,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Unable to update variant status",
      error: err.message,
    });
  }
};

module.exports = {
  addVariant,
  getVariants,
  getVariantsByCategory,
  updateVariant,
  deleteVariant,
  toggleVariantStatus,
};
