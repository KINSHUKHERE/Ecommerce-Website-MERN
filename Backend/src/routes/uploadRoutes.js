const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post(
  "/upload",
  verifyUser,
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      // Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "yocart_products",
      });

      // Delete the temporary local file from the disk
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        msg: "Image uploaded successfully",
        url: result.secure_url,
      });
    } catch (err) {
      // Clean up local file in case of error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error("Cloudinary upload error:", err);
      res.status(500).json({
        msg: "Error uploading image to Cloudinary",
        error: err.message,
      });
    }
  }
);

module.exports = router;
