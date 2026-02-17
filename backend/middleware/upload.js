const multer = require("multer");
const path = require("path");

// Use memory storage — files are kept as Buffers in req.file.buffer
// so they can be streamed directly to Cloudinary (no disk writes).
const storage = multer.memoryStorage();

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
