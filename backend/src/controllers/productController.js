const Product = require('../models/Product');
const ProductSource = require('../models/ProductSource');

// Helper to extract domain from URL
const extractDomain = (url) => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace('www.', '');
  } catch (err) {
    return null;
  }
};

// @desc    Get all products for logged in user (with pagination, search, filter)
// @route   GET /api/v1/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    let query;

    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Force user specific
    reqQuery.user = req.user.id;

    // Build query
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    query = Product.find(JSON.parse(queryStr));

    // Search by name
    if (req.query.search) {
      query = query.find({ name: { $regex: req.query.search, $options: 'i' } });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const products = await query.populate('sourceId', 'name domain');

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Private
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('sourceId', 'name domain');

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Add new product (Manual or via URL)
// @route   POST /api/v1/products
// @access  Private
exports.addProduct = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    let isUrlScrape = false;

    // If URL is provided, validate domain
    if (req.body.url) {
      const domain = extractDomain(req.body.url);
      if (domain) {
        // Find if source exists
        let source = await ProductSource.findOne({ domain });
        if (!source) {
          // Auto-create source if it doesn't exist for flexibility
          source = await ProductSource.create({ name: domain, domain });
        }
        req.body.sourceId = source._id;
        isUrlScrape = true;
      }
    }

    const product = await Product.create(req.body);

    // Push scraping job to Redis queue asynchronously if URL was provided
    if (isUrlScrape) {
      const scrapeQueue = require('../queues/scrapeQueue');
      await scrapeQueue.add('SCRAPE_PRODUCT', {
        productId: product._id,
        url: product.url,
        userId: req.user.id
      }, {
        priority: 1 // High priority for manual adds
      });
    }

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findOne({ _id: req.params.id, user: req.user.id });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Re-evaluate source if URL changed
    if (req.body.url && req.body.url !== product.url) {
      const domain = extractDomain(req.body.url);
      if (domain) {
        let source = await ProductSource.findOne({ domain });
        if (!source) {
          source = await ProductSource.create({ name: domain, domain });
        }
        req.body.sourceId = source._id;
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user.id });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await product.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
