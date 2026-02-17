const cloudinary = require("../config/cloudinary");

/**
 * Upload a single image to Cloudinary.
 * Expects multer memory-storage middleware to have run first,
 * so the file buffer is available at req.file.buffer.
 *
 * Query param `folder` can be "events" or "users" (default: "events").
 *
 * @route  POST /api/upload/image
 * @access Private
 */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Determine Cloudinary subfolder
    const allowedFolders = ["events", "users"];
    const folder = allowedFolders.includes(req.query.folder)
      ? req.query.folder
      : "events";

    // Upload buffer to Cloudinary via a stream
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `eventhub/${folder}`,
          resource_type: "image",
          transformation: [
            { width: 1920, height: 1080, crop: "limit" }, // cap max dimensions
            { quality: "auto", fetch_format: "auto" }, // auto-optimize
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      stream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
    });
  }
};

/**
 * Delete an image from Cloudinary by its public_id.
 * This is a utility used internally by other controllers.
 *
 * @param {string} publicId - The Cloudinary public_id to delete
 * @returns {Promise<object>} Cloudinary deletion result
 */
exports.deleteImage = async (publicId) => {
  if (!publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return null;
  }
};
