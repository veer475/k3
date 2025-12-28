// src/routes/deliveries.js
import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import Order from '../model/Order.js';

const router = express.Router();

/**
 * Get delivery person's assignments
 * MUST come before /:id
 */
router.get(
  '/delivery-person/assignments',
  authenticateToken,
  authorizeRoles('DELIVERY'),
  async (req, res) => {
    try {
      const deliveries = await Delivery.findByDeliveryPerson(req.user.id);
      res.json({ deliveries });
    } catch (error) {
      console.error('Get delivery assignments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get pending deliveries (orders needing delivery action)
 */
router.get(
  '/pending',
  authenticateToken,
  authorizeRoles('ADMIN', 'DELIVERY'),
  async (_req, res) => {
    try {
      const orders = await Order.findPendingDeliveries();
      res.json({ orders });
    } catch (error) {
      console.error('Get pending deliveries error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get delivery by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const isBuyer = delivery.order.buyerId === req.user.id;
    const isSeller = delivery.order.listing.ownerId === req.user.id;
    const isAssignedDelivery = delivery.assignedToId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAssignedDelivery && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ delivery });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update delivery status
 */
router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('DELIVERY', 'ADMIN'),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const delivery = await Delivery.findById(req.params.id);
      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }

      if (
        req.user.role === 'DELIVERY' &&
        delivery.assignedToId !== req.user.id
      ) {
        return res.status(403).json({ error: 'Not assigned to this delivery' });
      }

      const updatedDelivery = await Delivery.updateStatus(
        req.params.id,
        status
      );

      res.json({
        message: 'Delivery status updated successfully',
        delivery: updatedDelivery
      });
    } catch (error) {
      console.error('Update delivery status error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

/**
 * Verify pickup OTP
 */
router.post(
  '/:id/verify-pickup-otp',
  authenticateToken,
  authorizeRoles('DELIVERY'),
  async (req, res) => {
    try {
      const { otp } = req.body;

      const verified = await Delivery.verifyPickupOtp(req.params.id, otp);
      if (!verified) {
        return res.status(400).json({ error: 'Invalid pickup OTP' });
      }

      res.json({ message: 'Pickup OTP verified successfully' });
    } catch (error) {
      console.error('Verify pickup OTP error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Verify delivery OTP
 */
router.post(
  '/:id/verify-delivery-otp',
  authenticateToken,
  authorizeRoles('DELIVERY'),
  async (req, res) => {
    try {
      const { otp } = req.body;

      const verified = await Delivery.verifyDeliveryOtp(req.params.id, otp);
      if (!verified) {
        return res.status(400).json({ error: 'Invalid delivery OTP' });
      }

      res.json({ message: 'Delivery OTP verified successfully' });
    } catch (error) {
      console.error('Verify delivery OTP error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Add pickup photos
 */
router.post(
  '/:id/pickup-photos',
  authenticateToken,
  authorizeRoles('DELIVERY', 'ADMIN'),
  async (req, res) => {
    try {
      const { photoUrls } = req.body;

      if (!Array.isArray(photoUrls)) {
        return res.status(400).json({ error: 'photoUrls must be an array' });
      }

      await Delivery.addPickupPhotos(req.params.id, photoUrls);

      res.json({ message: 'Pickup photos added successfully' });
    } catch (error) {
      console.error('Add pickup photos error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Add delivery photos
 */
router.post(
  '/:id/delivery-photos',
  authenticateToken,
  authorizeRoles('DELIVERY', 'ADMIN'),
  async (req, res) => {
    try {
      const { photoUrls } = req.body;

      if (!Array.isArray(photoUrls)) {
        return res.status(400).json({ error: 'photoUrls must be an array' });
      }

      await Delivery.addDeliveryPhotos(req.params.id, photoUrls);

      res.json({ message: 'Delivery photos added successfully' });
    } catch (error) {
      console.error('Add delivery photos error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;