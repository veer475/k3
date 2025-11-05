// src/routes/users.js
import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import Address from '../model/address';
import User from '../model/user';
const router = express.Router();

// Get user addresses
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const addresses = await Address.findByUserId(req.user.id);
    res.json({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add address
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const addressData = {
      ...req.body,
      userId: req.user.id
    };

    const address = await Address.create(addressData);
    res.status(201).json({
      message: 'Address added successfully',
      address
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update address
router.put('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (address.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedAddress = await Address.update(req.params.id, req.body);
    res.json({
      message: 'Address updated successfully',
      address: updatedAddress
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete address
router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (address.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Address.softDelete(req.params.id);
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set default address
router.patch('/addresses/:id/default', authenticateToken, async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (address.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Address.setDefaultAddress(req.user.id, req.params.id);
    res.json({ message: 'Default address set successfully' });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (Admin only)
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await User.getAllUsers(parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;