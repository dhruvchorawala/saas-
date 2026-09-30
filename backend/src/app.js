const path = require('path');
const dotenv = require('dotenv');

// Load env vars from backend/.env regardless of the working directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const errorHandler = require('./middlewares/error');
const { apiLimiter } = require('./middlewares/rateLimit');

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:3000').split(','),
  credentials: true
}));

app.use('/api/', apiLimiter);

app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/watchlist', require('./routes/watchlistRoutes'));
app.use('/api/v1/alerts', require('./routes/alertRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/health', require('./routes/healthRoutes'));

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handler middleware (must be after routes)
app.use(errorHandler);

module.exports = app;
