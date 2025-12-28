// src/routes/auth.js
import express from 'express';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import User from '../model/User.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    let { email, password, fullName, phone, role } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: 'Email, password, and full name are required'
      });
    }

    email = email.toLowerCase().trim();

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists with this email'
      });
    }

    const user = await User.create({
      email,
      password,
      fullName,
      phone,
      role: role || 'USER'
    });

    const token = generateToken(user.id, user.email, user.role);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email'
      });
    }

    const isValidPassword = await User.comparePassword(
      password,
      user.passwordHash
    );

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid password'
      });
    }

    const token = generateToken(user.id, user.email, user.role);

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (safe payload)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, avatarUrl, bio, phone } = req.body;

    if (phone !== undefined) {
      await User.update(req.user.id, { phone });
    }

    const profile = await User.createOrUpdateProfile(req.user.id, {
      fullName,
      avatarUrl,
      bio
    });

    return res.json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token discard)
router.post('/logout', authenticateToken, async (_req, res) => {
  return res.json({
    message: 'Logged out successfully'
  });
});

export default router;