const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    // Generate random filename to prevent path traversal and overwrites
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${safeExt}`);
  },
});

// File filter — whitelist safe image types only
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedExts = /\.(jpeg|jpg|png|gif|webp)$/i;

  const mimeOk = allowedMimes.includes(file.mimetype);
  const extOk = allowedExts.test(path.extname(file.originalname));

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Max 1 file per request
  },
});

module.exports = upload;
