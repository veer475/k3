// src/routes/users.js
import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import Address from '../model/Address.js';
import User from '../model/User.js';

const router = express.Router();

/**
 * Get logged-in user's addresses
 */
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const addresses = await Address.findByUserId(req.user.id);
    res.json({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get default address
 */
router.get('/addresses/default', authenticateToken, async (req, res) => {
  try {
    const address = await Address.findDefaultByUser(req.user.id);
    res.json({ address });
  } catch (error) {
    console.error('Get default address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Add address
 */
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const address = await Address.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      message: 'Address added successfully',
      address
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update address
 */
router.put('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await Address.update(
      req.params.id,
      req.user.id,
      req.body
    );

    if (!updated) {
      return res.status(404).json({
        error: 'Address not found or not authorized'
      });
    }

    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete address (soft delete)
 */
router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Address.softDelete(
      req.params.id,
      req.user.id
    );

    if (!deleted) {
      return res.status(404).json({
        error: 'Address not found or not authorized'
      });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Set default address
 */
router.patch('/addresses/:id/default', authenticateToken, async (req, res) => {
  try {
    const success = await Address.setDefaultAddress(
      req.user.id,
      req.params.id
    );

    if (!success) {
      return res.status(404).json({
        error: 'Address not found or not authorized'
      });
    }

    res.json({ message: 'Default address set successfully' });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Admin: get all users
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await User.getAllUsers(
        Number(page),
        Number(limit)
      );
      res.json(result);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Admin: get single user with profile
 */
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
