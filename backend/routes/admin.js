import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import User from '../model/User.js';
import Order from '../model/Order.js';
import Listing from '../model/Listing.js';
import Wallet from '../model/Wallet.js';
import Transaction from '../model/Transaction.js';

const router = express.Router();

router.use(authenticateToken, authorizeRoles('ADMIN'));

/**
 * Admin dashboard summary
 */
router.get('/dashboard', async (_req, res) => {
  try {
    const [
      users,
      orders,
      listings,
      wallets,
      transactions
    ] = await Promise.all([
      User.getAllUsers(1, 1),
      Order.adminFindAll(),
      Listing.adminFindAll(),
      Wallet.adminFindAll(),
      Transaction.adminFindAll()
    ]);

    res.json({
      totalUsers: users.pagination.total,
      totalOrders: orders.length,
      totalListings: listings.length,
      totalWallets: wallets.length,
      totalTransactions: transactions.length
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Admin: get user wallet
 */
router.get('/users/:id/wallet', async (req, res) => {
  try {
    const wallet = await Wallet.findByUserId(req.params.id);
    res.json({ wallet });
  } catch (error) {
    console.error('Admin get wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
