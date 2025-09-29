const User = require('../models/User');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    const result = await User.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      search,
      sortBy,
      sortOrder,
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    // Users can only view their own profile, admins can view any profile
    if (requestingUser.id !== parseInt(id) && requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const requestingUser = req.user;

    // Users can only update their own profile, admins can update any profile
    if (requestingUser.id !== parseInt(id) && requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const success = await User.update(id, updateData);

    if (!success) {
      return res.status(400).json({ message: 'Failed to update user profile' });
    }

    // Get updated user data
    const updatedUser = await User.findById(id);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Change user password
const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const requestingUser = req.user;

    // Users can only change their own password, admins can change any password
    if (requestingUser.id !== parseInt(id) && requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (requestingUser.role === 'admin') {
      // Admin can change password without current password
      const success = await User.updatePassword(id, newPassword);

      if (!success) {
        return res.status(400).json({ message: 'Failed to update password' });
      }
    } else {
      // Regular user must provide current password
      const success = await User.changePassword(id, currentPassword, newPassword);

      if (!success) {
        return res.status(400).json({ message: 'Failed to update password' });
      }
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);

    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const success = await User.updateRole(id, role);

    if (!success) {
      return res.status(400).json({ message: 'Failed to update user role' });
    }

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);

    if (error.message === 'Invalid role') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const success = await User.delete(id);

    if (!success) {
      return res.status(400).json({ message: 'Failed to delete user' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user statistics (admin only)
const getUserStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await User.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify user email
const verifyUserEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // TODO: Implement email verification token validation
    // For now, this is a placeholder

    res.json({ message: 'Email verification endpoint - implementation needed' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // TODO: Implement email verification resend
    // For now, this is a placeholder

    res.json({ message: 'Verification email resend endpoint - implementation needed' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // TODO: Implement forgot password functionality
    // For now, this is a placeholder

    res.json({ message: 'Forgot password endpoint - implementation needed' });
  } catch (error) {
    console.error('Error processing forgot password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // TODO: Implement password reset functionality
    // For now, this is a placeholder

    res.json({ message: 'Password reset endpoint - implementation needed' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserProfile,
  changeUserPassword,
  updateUserRole,
  deleteUser,
  getUserStats,
  verifyUserEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};
