const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadImage } = require("../controllers/uploadController");

// @desc    Upload a single image to Cloudinary
// @route   POST /api/upload/image
// @access  Private
router.post("/image", protect, upload.single("image"), uploadImage);

module.exports = router;
