// src/routes/orders.js
// const express = require('express');
// const { authenticateToken } = require('../middleware/auth');
// const Order = require('../models/Order');
// const Transaction = require('../models/Transaction');
// const router = express.Router();
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import Order from '../model/order';
import Transaction from '../model/transaction';
const router = express.Router();
// Create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      buyerId: req.user.id
    };

    const order = await Order.create(orderData);

    // Create initial transaction
    await Transaction.create({
      orderId: order.id,
      userId: req.user.id,
      amount: order.totalAmount,
      type: 'HOLD',
      provider: 'system',
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

// Get order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is buyer, seller, or admin
    const isBuyer = order.buyerId === req.user.id;
    const isSeller = order.listing.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's orders (as buyer)
router.get('/user/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findByBuyer(req.user.id);
    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get seller's orders
router.get('/seller/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findBySeller(req.user.id);
    res.json({ orders });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, deliveryData } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    const isSeller = order.listing.ownerId === req.user.id;
    const isBuyer = order.buyerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const isDelivery = req.user.role === 'DELIVERY';

    if (!isSeller && !isBuyer && !isAdmin && !isDelivery) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedOrder = await Order.updateStatus(req.params.id, status, deliveryData);
    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign delivery person
router.patch('/:id/assign-delivery', authenticateToken, async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only admin or seller can assign delivery
    const isSeller = order.listing.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSeller && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to assign delivery' });
    }

    const updatedOrder = await Order.assignDeliveryPerson(req.params.id, deliveryPersonId);
    res.json({
      message: 'Delivery person assigned successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;