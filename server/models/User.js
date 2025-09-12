const db = require('../database/config');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    try {
      const { firstName, lastName, email, password, phone, address } = userData;
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const [result] = await db.execute(
        `INSERT INTO users (firstName, lastName, email, password, phone, address, role, emailVerified, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          firstName,
          lastName,
          email,
          hashedPassword,
          phone || null,
          address ? JSON.stringify(address) : null,
          'customer',
          false
        ]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT id, firstName, lastName, email, phone, address, role, emailVerified, createdAt, updatedAt FROM users WHERE id = ?',
        [id]
      );
      
      if (rows[0]) {
        // Parse address JSON
        if (rows[0].address) {
          rows[0].address = JSON.parse(rows[0].address);
        }
      }
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const allowedFields = ['firstName', 'lastName', 'phone', 'address'];
      const updates = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          values.push(key === 'address' ? JSON.stringify(value) : value);
        }
      }
      
      if (updates.length === 0) {
        return false;
      }
      
      updates.push('updatedAt = NOW()');
      values.push(id);
      
      const [result] = await db.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updatePassword(id, newPassword) {
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      const [result] = await db.execute(
        'UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?',
        [hashedPassword, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmail(id) {
    try {
      const [result] = await db.execute(
        'UPDATE users SET emailVerified = true, updatedAt = NOW() WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateRole(id, role) {
    try {
      const allowedRoles = ['customer', 'admin', 'moderator'];
      
      if (!allowedRoles.includes(role)) {
        throw new Error('Invalid role');
      }
      
      const [result] = await db.execute(
        'UPDATE users SET role = ?, updatedAt = NOW() WHERE id = ?',
        [role, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, role, search, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
      const offset = (page - 1) * limit;
      
      let whereClause = '';
      const params = [];
      
      if (role) {
        whereClause += 'WHERE role = ?';
        params.push(role);
      }
      
      if (search) {
        const searchClause = 'WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ?';
        if (whereClause) {
          whereClause = whereClause.replace('WHERE', 'AND');
          whereClause = `WHERE ${whereClause} AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)`;
        } else {
          whereClause = searchClause;
        }
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
      const usersQuery = `
        SELECT id, firstName, lastName, email, phone, address, role, emailVerified, createdAt, updatedAt 
        FROM users 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      const [countResult] = await db.execute(countQuery, params);
      const [users] = await db.execute(usersQuery, [...params, parseInt(limit), offset]);
      
      // Parse address JSON for each user
      users.forEach(user => {
        if (user.address) {
          try {
            user.address = JSON.parse(user.address);
          } catch (e) {
            user.address = null;
          }
        }
      });
      
      const totalPages = Math.ceil(countResult[0].total / limit);
      
      return {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: countResult[0].total,
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async getStats() {
    try {
      const [totalUsers] = await db.execute('SELECT COUNT(*) as total FROM users');
      const [roleStats] = await db.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role');
      const [verificationStats] = await db.execute('SELECT emailVerified, COUNT(*) as count FROM users GROUP BY emailVerified');
      
      return {
        totalUsers: totalUsers[0].total,
        roleBreakdown: roleStats,
        verificationBreakdown: verificationStats
      };
    } catch (error) {
      throw error;
    }
  }

  static async authenticate(email, password) {
    try {
      const user = await this.findByEmail(email);
      
      if (!user) {
        return null;
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(id, currentPassword, newPassword) {
    try {
      const user = await this.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }
      
      // Update to new password
      return await this.updatePassword(id, newPassword);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
