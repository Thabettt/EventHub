const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  changePassword,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

// Protected route - get current user profile
router.get("/me", protect, getProfile);

// protected route - update user profile
router.put("/me", protect, updateProfile);

// protected route - delete user profile
router.delete("/me", protect, deleteProfile);

// Admin route - get all users
router.get("/", protect, authorize("System Admin"), getAllUsers);

// Admin route - get user by ID
router.get("/:id", protect, authorize("System Admin"), getUserById);

// Admin route - update user by ID
router.put("/:id", protect, authorize("System Admin"), updateUser);

// Admin route - update user role by ID
router.patch("/:id/role", protect, authorize("System Admin"), updateUserRole);

// Admin route - delete user by ID
router.delete("/:id", protect, authorize("System Admin"), deleteUser);

// Password change route - using the controller function
router.put("/me/password", protect, changePassword);

module.exports = router;
