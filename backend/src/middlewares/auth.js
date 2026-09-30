const jwt = require('jsonwebtoken');
const User = require('../models/User');

function readToken(req) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return req.cookies && req.cookies.token;
}

async function userFromToken(token) {
  if (!token || token === 'none') return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id);
  } catch {
    return null;
  }
}

// Protect routes
exports.protect = async (req, res, next) => {
  const user = await userFromToken(readToken(req));
  if (!user) {
    return res.status(401).json({ success: false, error: 'Please log in to continue' });
  }
  req.user = user;
  next();
};

// Attach the user when a valid token is present, but never block the request
exports.optionalAuth = async (req, res, next) => {
  req.user = await userFromToken(readToken(req));
  next();
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
