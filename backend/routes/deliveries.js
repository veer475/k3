// src/routes/deliveries.js
// const express = require('express');
// const { authenticateToken, authorizeRoles } = require('../middleware/auth');
// const Delivery = require('../models/Delivery');
// const Order = require('../models/Order');
// const router = express.Router();
import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import Delivery from '../model/Delivery.js';
import Order from '../model/Order.js';
const router = express.Router();

// Get delivery by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Check authorization
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

// Get delivery person's assignments
router.get('/delivery-person/assignments', authenticateToken, authorizeRoles('DELIVERY'), async (req, res) => {
  try {
    const deliveries = await Delivery.findByDeliveryPerson(req.user.id);
    res.json({ deliveries });
  } catch (error) {
    console.error('Get delivery assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update delivery status
router.patch('/:id/status', authenticateToken, authorizeRoles('DELIVERY', 'ADMIN'), async (req, res) => {
  try {
    const { status, ...updateData } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Check if delivery person is assigned to this delivery
    if (req.user.role === 'DELIVERY' && delivery.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Not assigned to this delivery' });
    }

    const updatedDelivery = await Delivery.updateStatus(req.params.id, status, updateData);
    res.json({
      message: 'Delivery status updated successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add pickup photos
router.post('/:id/pickup-photos', authenticateToken, authorizeRoles('DELIVERY', 'ADMIN'), async (req, res) => {
  try {
    const { photoUrls } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (req.user.role === 'DELIVERY' && delivery.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Not assigned to this delivery' });
    }

    const updatedDelivery = await Delivery.addPickupPhotos(req.params.id, photoUrls);
    res.json({
      message: 'Pickup photos added successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Add pickup photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add delivery photos
router.post('/:id/delivery-photos', authenticateToken, authorizeRoles('DELIVERY', 'ADMIN'), async (req, res) => {
  try {
    const { photoUrls } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (req.user.role === 'DELIVERY' && delivery.assignedToId !== req.user.id) {
      return res.status(403).json({ error: 'Not assigned to this delivery' });
    }

    const updatedDelivery = await Delivery.addDeliveryPhotos(req.params.id, photoUrls);
    res.json({
      message: 'Delivery photos added successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error('Add delivery photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending deliveries
router.get('/pending/deliveries', authenticateToken, authorizeRoles('ADMIN', 'DELIVERY'), async (req, res) => {
  try {
    const orders = await Order.findPendingDeliveries();
    res.json({ orders });
  } catch (error) {
    console.error('Get pending deliveries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;