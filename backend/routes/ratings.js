// src/routes/ratings.js
import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import Rating from '../model/Rating.js';

const router = express.Router();

/**
 * Create rating
 * Only allowed after completed order (enforced in model)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiverId, orderId, score, comment } = req.body;

    if (!receiverId || !score) {
      return res.status(400).json({
        error: 'receiverId and score are required'
      });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({
        error: 'Score must be between 1 and 5'
      });
    }

    const rating = await Rating.create({
      giverId: req.user.id,
      receiverId,
      orderId,
      score,
      comment
    });

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(400).json({
      error: error.message || 'Unable to submit rating'
    });
  }
});

/**
 * Get ratings received by a user (public)
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const [ratings, averageRating] = await Promise.all([
      Rating.findByReceiverId(userId),
      Rating.getUserAverageRating(userId)
    ]);

    res.json({
      ratings,
      averageRating
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get ratings given by logged-in user
 */
router.get('/me/given', authenticateToken, async (req, res) => {
  try {
    const ratings = await Rating.findByGiverId(req.user.id);
    res.json({ ratings });
  } catch (error) {
    console.error('Get given ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get ratings for an order
 * Buyer / Seller / Admin only
 */
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const ratings = await Rating.findByOrderId(req.params.orderId);
    res.json({ ratings });
  } catch (error) {
    console.error('Get order ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Admin: delete rating (moderation)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  async (req, res) => {
    try {
      await Rating.deleteById(req.params.id);
      res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
      console.error('Delete rating error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
