// src/routes/ratings.js
// const express = require('express');
// const { authenticateToken } = require('../middleware/auth');
// const Rating = require('../models/Rating');
// const router = express.Router();
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Rating from '../model/Rating.js';
const router = express.Router();

// Create rating
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiverId, orderId, score, comment } = req.body;

    if (!receiverId || !score) {
      return res.status(400).json({ error: 'Receiver ID and score are required' });
    }

    const ratingData = {
      giverId: req.user.id,
      receiverId,
      orderId,
      score,
      comment
    };

    const rating = await Rating.create(ratingData);
    res.status(201).json({
      message: 'Rating submitted successfully',
      rating
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user ratings
router.get('/user/:userId', async (req, res) => {
  try {
    const ratings = await Rating.findByReceiverId(req.params.userId);
    const averageRating = await Rating.getUserAverageRating(req.params.userId);
    
    res.json({
      ratings,
      averageRating
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order ratings
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const ratings = await Rating.findByOrderId(req.params.orderId);
    res.json({ ratings });
  } catch (error) {
    console.error('Get order ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;