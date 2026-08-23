const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/error');
const { apiLimiter } = require('./middlewares/rateLimit');

// Load env vars
dotenv.config({ path: './.env' });

// Route files
const auth = require('./routes/authRoutes');
const products = require('./routes/productRoutes');
const watchlist = require('./routes/watchlistRoutes');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000', // frontend URL
  credentials: true
}));

// Apply global rate limiting
app.use(apiLimiter);

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/products', products);
app.use('/api/v1/watchlist', watchlist);

// Error handler middleware (must be after routes)
app.use(errorHandler);

module.exports = app;
