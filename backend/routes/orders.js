// src/routes/orders.js
import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import Order from '../model/Order.js';
import Transaction from '../model/Transaction.js';

const router = express.Router();

/**
 * Create order
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      buyerId: req.user.id
    });

    // Initial HOLD transaction
    await Transaction.create({
      orderId: order.id,
      userId: req.user.id,
      amount: order.totalAmount,
      type: 'HOLD',
      provider: 'SYSTEM',
      providerId: `hold_${order.id}`
    });

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Buyer: my orders
 * MUST come before /:id
 */
router.get('/user/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findByBuyer(req.user.id);
    res.json({ orders });
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Seller: my orders
 */
router.get('/seller/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findBySeller(req.user.id);
    res.json({ orders });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Admin: all orders
 */
router.get(
  '/admin/all',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (_req, res) => {
    try {
      const orders = await Order.adminFindAll();
      res.json({ orders });
    } catch (error) {
      console.error('Admin orders error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get order by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isBuyer = order.buyerId === req.user.id;
    const isSeller = order.listing.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update order status (validated in model)
 */
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isBuyer = order.buyerId === req.user.id;
    const isSeller = order.listing.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isDelivery = req.user.role === 'DELIVERY';

    // Basic role gate (model enforces transitions)
    if (!isBuyer && !isSeller && !isAdmin && !isDelivery) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedOrder = await Order.updateStatus(
      req.params.id,
      status
    );

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * Assign delivery person (ADMIN / SELLER)
 */
router.patch('/:id/assign-delivery', authenticateToken, async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;

    if (!deliveryPersonId) {
      return res.status(400).json({ error: 'deliveryPersonId is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isSeller = order.listing.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSeller && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedOrder = await Order.assignDeliveryPerson(
      req.params.id,
      deliveryPersonId
    );

    res.json({
      message: 'Delivery person assigned successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Cancel order (buyer / admin)
 */
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isBuyer = order.buyerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBuyer && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Order.cancel(req.params.id);

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
