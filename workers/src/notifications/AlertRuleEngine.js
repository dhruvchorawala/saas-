const AlertRule = require('../models/AlertRule');
const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');

let notificationQueue = null;

function getQueue() {
  if (!notificationQueue) {
    notificationQueue = new Queue('notification-queue', { connection: redisConnection });
  }
  return notificationQueue;
}

class AlertRuleEngine {
  /**
   * Evaluates all active alerts for a given product against the detected changes.
   */
  static async evaluateAndTrigger(productId, changes, currentProductState) {
    if (!changes.hasChanged) return;

    // Fetch all active rules for this product
    const activeRules = await AlertRule.find({ product: productId, isActive: true });

    if (activeRules.length === 0) return;

    for (const rule of activeRules) {
      let isTriggered = false;
      let message = '';

      switch (rule.type) {
        case 'TARGET_PRICE':
          if (currentProductState.price <= rule.threshold) {
            isTriggered = true;
            message = `Your target price of ₹${rule.threshold} has been reached! Current price: ₹${currentProductState.price}`;
          }
          break;

        case 'PRICE_DROP_PERCENT':
          if (changes.isPriceDrop && changes.priceDifferencePercentage >= rule.threshold) {
            isTriggered = true;
            message = `Price dropped by ${changes.priceDifferencePercentage.toFixed(2)}%! Now at ₹${currentProductState.price}`;
          }
          break;

        case 'BACK_IN_STOCK':
          if (changes.isBackInStock) {
            isTriggered = true;
            message = `Item is back in stock at ₹${currentProductState.price}!`;
          }
          break;

        case 'ANY_PRICE_CHANGE':
          if (changes.isPriceDrop || changes.isPriceIncrease) {
            isTriggered = true;
            const direction = changes.isPriceDrop ? 'dropped' : 'increased';
            message = `Price ${direction} to ₹${currentProductState.price}.`;
          }
          break;
      }

      if (isTriggered) {
        // Enqueue a notification job
        await getQueue().add('SEND_NOTIFICATION', {
          userId: rule.user,
          productId: rule.product,
          alertRuleId: rule._id,
          message: message,
          provider: 'EMAIL' // Defaulting to EMAIL for now
        });
      }
    }
  }
}

module.exports = AlertRuleEngine;
