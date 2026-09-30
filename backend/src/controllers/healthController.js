const mongoose = require('mongoose');
const refreshQueue = require('../services/refreshQueue');

exports.getHealth = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
  const health = {
    status: dbStatus === 'UP' ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbStatus,
      api: 'UP',
      refreshQueue: refreshQueue.stats(),
    },
  };
  res.status(dbStatus === 'UP' ? 200 : 503).json(health);
};
