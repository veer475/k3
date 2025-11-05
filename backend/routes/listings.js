// src/routes/listings.js
// const express = require('express');
// const { authenticateToken } = require('../middleware/auth');
// const Listing = require('../models/Listing');
// const Item = require('../models/Item');
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import Listing from '../model/listing';
import Item from '../model/item';
const router = express.Router();

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const result = await Listing.findAll(req.query);
    res.json(result);
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single listing
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

// Create listing
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { item: itemData, ...listingData } = req.body;

    if (!itemData || !listingData.type) {
      return res.status(400).json({ error: 'Item data and listing type are required' });
    }

    // Create item first
    const item = await Item.create({
      ...itemData,
      ownerId: req.user.id
    });

    // Create listing
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

// Update listing
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    const updatedListing = await Listing.update(req.params.id, req.body);
    res.json({ 
      message: 'Listing updated successfully',
      listing: updatedListing 
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete listing
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    await Listing.softDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's listings
router.get('/user/my-listings', authenticateToken, async (req, res) => {
  try {
    const listings = await Listing.findByOwner(req.user.id);
    res.json({ listings });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update listing status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedListing = await Listing.updateStatus(req.params.id, status);
    res.json({
      message: 'Listing status updated successfully',
      listing: updatedListing
    });
  } catch (error) {
    console.error('Update listing status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;