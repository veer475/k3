import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import Wallet from '../model/Wallet.js';
import Transaction from '../model/Transaction.js';

const router = express.Router();

/**
 * Get logged-in user's wallet
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const balance = await Wallet.getBalance(req.user.id);
    res.json({ balance });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get logged-in user's wallet transactions
 */
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.findByUserId(req.user.id);
    res.json({ transactions });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Admin: credit wallet
 */
router.post(
  '/credit',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const { userId, amount, orderId } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({
          error: 'userId and amount are required'
        });
      }

      await Wallet.credit(userId, amount, orderId);

      res.json({ message: 'Wallet credited successfully' });
    } catch (error) {
      console.error('Credit wallet error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Admin: debit wallet
 */
router.post(
  '/debit',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      const { userId, amount, orderId } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({
          error: 'userId and amount are required'
        });
      }

      await Wallet.debit(userId, amount, orderId);

      res.json({ message: 'Wallet debited successfully' });
    } catch (error) {
      console.error('Debit wallet error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;