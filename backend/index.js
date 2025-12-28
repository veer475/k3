// src/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import listingRoutes from './routes/listings.js';
import orderRoutes from './routes/orders.js';
import deliveryRoutes from './routes/deliveries.js';
import ratingRoutes from './routes/ratings.js';
import walletRoutes from './routes/wallet.js';
import transactionRoutes from './routes/transactions.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * ───────────────────────────────────────
 * Global Middleware
 * ───────────────────────────────────────
 */
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * ───────────────────────────────────────
 * API Routes
 * ───────────────────────────────────────
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

/**
 * ───────────────────────────────────────
 * Health Check
 * ───────────────────────────────────────
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Fashion Rental API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * ───────────────────────────────────────
 * Error Handling
 * ───────────────────────────────────────
 */
app.use((error, req, res, _next) => {
  console.error('Unhandled error:', error);

  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  });
});

/**
 * ───────────────────────────────────────
 * 404 Handler
 * ───────────────────────────────────────
 */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * ───────────────────────────────────────
 * Server Start
 * ───────────────────────────────────────
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
