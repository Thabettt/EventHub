const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Get current user profile
// @route   GET /users/me
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    // req.user is already set by the protect middleware
    // Return user without password
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting user profile",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Find user by ID
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating user profile",
    });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    // Find user by ID and delete
    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting user profile",
    });
  }
};

// Admin access

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password field

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting all users",
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // Exclude password field

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting user by ID",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Find user by ID
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role; // Admin can change user role

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating user",
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Find user by ID
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user role
    if (role) user.role = role; // Admin can change user role

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating user role",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Find user by ID and delete
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting user",
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/me/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};
