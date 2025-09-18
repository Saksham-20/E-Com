const express = require('express');
const { query } = require('../database/config');
const { authenticateToken } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        w.id,
        w.created_at,
        p.id as product_id,
        p.name,
        p.slug,
        p.price,
        p.compare_price,
        p.sku,
        c.name as category_name,
        c.slug as category_slug,
        b.name as brand_name,
        b.slug as brand_slug,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id AND pi.is_primary = true
          LIMIT 1
        ) as primary_image
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE w.user_id = $1 AND p.is_active = true
      ORDER BY w.created_at DESC
    `, [req.user.id]);

    // Clean up wishlist entries for products that no longer exist
    const cleanupResult = await query(`
      DELETE FROM wishlist 
      WHERE user_id = $1 AND product_id NOT IN (
        SELECT id FROM products WHERE is_active = true
      )
    `, [req.user.id]);

    if (cleanupResult.rowCount > 0) {
      console.log(`Cleaned up ${cleanupResult.rowCount} stale wishlist entries for user ${req.user.id}`);
    }

    res.json({
      success: true,
      data: {
        items: result.rows
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/wishlist
// @desc    Add item to wishlist
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id } = req.body;
    
    // Adding item to wishlist

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and is active
    const productResult = await query(
      'SELECT id, name FROM products WHERE id = $1 AND is_active = true',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if item already exists in wishlist
    const existingItem = await query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingItem.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    const result = await query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING id',
      [req.user.id, product_id]
    );

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist',
      data: {
        wishlist_item_id: result.rows[0].id,
        product_name: productResult.rows[0].name
      }
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/wishlist/:id
// @desc    Remove item from wishlist
// @access  Private
router.delete('/:id', authenticateToken, validateUUID, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Removing item from wishlist

    // First try to delete by wishlist item ID
    let result = await query(
      'DELETE FROM wishlist WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    // If no rows affected, try to delete by product ID
    if (result.rows.length === 0) {
      result = await query(
        'DELETE FROM wishlist WHERE product_id = $1 AND user_id = $2 RETURNING id',
        [id, req.user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/wishlist
// @desc    Clear entire wishlist
// @access  Private
router.delete('/', authenticateToken, async (req, res) => {
  try {
    // Clear all items from user's wishlist
    await query(
      'DELETE FROM wishlist WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

