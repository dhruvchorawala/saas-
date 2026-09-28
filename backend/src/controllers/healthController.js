const mongoose = require('mongoose');
const IORedis = require('ioredis');

const redis = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_HOST?.includes('upstash.io') ? {} : undefined,
});

exports.getHealth = async (req, res, next) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
    
    let redisStatus = 'DOWN';
    try {
      await redis.ping();
      redisStatus = 'UP';
    } catch (e) {
      redisStatus = 'DOWN';
    }

    const health = {
      status: dbStatus === 'UP' && redisStatus === 'UP' ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      services: {
        database: dbStatus,
        redis: redisStatus,
        api: 'UP'
      }
    };

    const statusCode = health.status === 'UP' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (err) {
    next(err);
  }
};
