const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/config');

const authController = {
  // Register a new user
  async register(req, res) {
    try {
      const { email, password, first_name, last_name, phone } = req.body;

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email],
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, phone, is_admin, is_verified, created_at',
        [email, hashedPassword, first_name, last_name, phone],
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            is_admin: user.is_admin,
            is_verified: user.is_verified,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
      });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const result = await pool.query(
        'SELECT id, email, password_hash, first_name, last_name, phone, is_admin, is_verified FROM users WHERE email = $1',
        [email],
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const user = result.rows[0];

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            is_admin: user.is_admin,
            is_verified: user.is_verified,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login',
      });
    }
  },

  // Get current user profile
  async getProfile(req, res) {
    try {
      const result = await pool.query(
        'SELECT id, email, first_name, last_name, phone, is_admin, is_verified, created_at, updated_at FROM users WHERE id = $1',
        [req.user.id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const user = result.rows[0];
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            is_admin: user.is_admin,
            is_verified: user.is_verified,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching profile',
      });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { first_name, last_name, phone } = req.body;
      const userId = req.user.id;

      // Update user
      const result = await pool.query(
        'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), phone = COALESCE($3, phone), updated_at = NOW() WHERE id = $4 RETURNING id, email, first_name, last_name, phone, is_admin, is_verified, updated_at',
        [first_name, last_name, phone, userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const user = result.rows[0];
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            is_admin: user.is_admin,
            is_verified: user.is_verified,
            updated_at: user.updated_at,
          },
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating profile',
      });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.user.id;

      if (!current_password || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        });
      }

      if (new_password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long',
        });
      }

      // Get current password hash
      const result = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        current_password,
        result.rows[0].password_hash,
      );

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

      // Update password
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [hashedNewPassword, userId],
      );

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while changing password',
      });
    }
  },
};

module.exports = authController;
