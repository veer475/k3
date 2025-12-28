import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import Transaction from '../model/Transaction.js';

const router = express.Router();

/**
 * Get logged-in user's transactions
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.findByUserId(req.user.id);
    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get transactions for an order
 */
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.findByOrderId(req.params.orderId);
    res.json({ transactions });
  } catch (error) {
    console.error('Get order transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Admin: get transaction by ID
 */
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json({ transaction });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Admin: all transactions
 */
router.get(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (_req, res) => {
    try {
      const transactions = await Transaction.adminFindAll();
      res.json({ transactions });
    } catch (error) {
      console.error('Admin transactions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;