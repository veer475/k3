// src/routes/listings.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Listing from '../model/Listing.js';
import Item from '../model/Item.js';

const router = express.Router();

/**
 * Get all listings (public)
 */
router.get('/', async (req, res) => {
  try {
    const result = await Listing.findAll(req.query);
    res.json(result);
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get logged-in user's listings
 * MUST come before /:id
 */
router.get('/user/my-listings', authenticateToken, async (req, res) => {
  try {
    const listings = await Listing.findByOwner(req.user.id);
    res.json({ listings });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get single listing (public)
 */
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create listing (item + listing)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { item: itemData, ...listingData } = req.body;

    if (!itemData || !listingData.type) {
      return res.status(400).json({
        error: 'Item data and listing type are required'
      });
    }

    if (
      listingData.type === 'RENT' &&
      !listingData.pricePerDay
    ) {
      return res.status(400).json({
        error: 'pricePerDay is required for RENT listings'
      });
    }

    if (
      listingData.type === 'SALE' &&
      !listingData.price
    ) {
      return res.status(400).json({
        error: 'price is required for SALE listings'
      });
    }

    const item = await Item.create({
      ...itemData,
      ownerId: req.user.id
    });

    const listing = await Listing.create({
      ...listingData,
      itemId: item.id,
      ownerId: req.user.id
    });

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update listing (owner only)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await Listing.update(
      req.params.id,
      req.user.id,
      req.body
    );

    if (!updated) {
      return res.status(403).json({
        error: 'Not authorized or listing cannot be updated'
      });
    }

    res.json({
      message: 'Listing updated successfully'
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Pause listing
 */
router.patch('/:id/pause', authenticateToken, async (req, res) => {
  try {
    await Listing.pause(req.params.id, req.user.id);
    res.json({ message: 'Listing paused successfully' });
  } catch (error) {
    console.error('Pause listing error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Resume listing
 */
router.patch('/:id/resume', authenticateToken, async (req, res) => {
  try {
    await Listing.resume(req.params.id, req.user.id);
    res.json({ message: 'Listing resumed successfully' });
  } catch (error) {
    console.error('Resume listing error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Mark listing as sold
 */
router.patch('/:id/sold', authenticateToken, async (req, res) => {
  try {
    await Listing.markAsSold(req.params.id, req.user.id);
    res.json({ message: 'Listing marked as sold' });
  } catch (error) {
    console.error('Mark sold error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete listing (soft delete)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Listing.softDelete(
      req.params.id,
      req.user.id
    );

    if (!deleted) {
      return res.status(403).json({
        error: 'Not authorized or listing not found'
      });
    }

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
