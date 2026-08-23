const { Worker } = require('bullmq');
const redisConnection = require('../../config/redis');
const NotificationHistory = require('../../models/NotificationHistory');
const EmailProvider = require('./providers/EmailProvider');

// Simple registry for modular providers
const providerRegistry = {
  'EMAIL': new EmailProvider(),
  // 'TELEGRAM': new TelegramProvider(),
};

const notificationWorker = new Worker('notification-queue', async (job) => {
  const { userId, productId, alertRuleId, message, provider } = job.data;
  console.log(`[NotificationWorker] Processing job ${job.id} for user ${userId}`);

  const notificationProvider = providerRegistry[provider];
  if (!notificationProvider) {
    throw new Error(`Provider ${provider} not found in registry`);
  }

  // Attempt to send
  const result = await notificationProvider.send(userId, message);

  // Write status to history
  await NotificationHistory.create({
    user: userId,
    product: productId,
    alertRule: alertRuleId,
    status: result.success ? 'SENT' : 'FAILED',
    message: message,
    provider: provider,
    errorDetails: result.errorDetails || null
  });

  if (!result.success) {
    throw new Error(result.errorDetails); // Triggers BullMQ retry logic
  }

  return { success: true };

}, {
  connection: redisConnection,
  concurrency: 10,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000 // Retry starting at 5s
  }
});

module.exports = notificationWorker;
