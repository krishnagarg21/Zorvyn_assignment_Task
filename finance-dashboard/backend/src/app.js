const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { sendError } = require('./utils/apiResponse');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

/* ──────────────────────────── Middleware Stack ──────────────────────────── */

// 1. Security headers
app.use(helmet());

// 2. CORS — allow frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// 3. Body parser
app.use(express.json({ limit: '10kb' }));

// 4. Request logging (skip in test environments)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/* ──────────────────────────── Route Mounting ──────────────────────────── */

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Finance Dashboard API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

/* ──────────────────────────── 404 Handler ──────────────────────────── */

app.use((_req, res) => {
  sendError(res, 404, 'Route not found');
});

/* ──────────────────────────── Global Error Handler ──────────────────────────── */

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 400, 'Validation failed', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, 409, `Duplicate value for field: ${field}`);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return sendError(res, 400, 'Invalid ID format');
  }

  // Custom errors with statusCode (thrown from services)
  if (err.statusCode) {
    return sendError(res, err.statusCode, err.message);
  }

  // Unexpected errors — never leak raw error to client
  console.error('Unhandled error:', err);
  return sendError(res, 500, 'Internal server error');
});

module.exports = app;
