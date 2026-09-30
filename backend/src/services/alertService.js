const AlertRule = require('../models/AlertRule');
const Notification = require('../models/Notification');
const mailer = require('./mailer');

const formatINR = value => `₹${Number(value).toLocaleString('en-IN')}`;

/**
 * Returns the notification text if the rule fires for this price update, otherwise null.
 * @param rule     AlertRule document
 * @param product  product after the refresh
 * @param before   { bestPrice, inStock } before the refresh
 */
function checkRule(rule, product, before) {
  const price = product.bestPrice;
  const where = product.bestStore ? ` on ${product.bestStore}` : '';

  switch (rule.type) {
    case 'TARGET_PRICE':
      if (price && price <= rule.threshold && rule.lastTriggeredPrice !== price) {
        return `${product.name} is now ${formatINR(price)}${where} — at or below your target of ${formatINR(rule.threshold)}.`;
      }
      return null;

    case 'PRICE_DROP_PERCENT': {
      if (!price || !before.bestPrice || price >= before.bestPrice) return null;
      const drop = ((before.bestPrice - price) / before.bestPrice) * 100;
      if (drop >= rule.threshold) {
        return `${product.name} dropped ${drop.toFixed(1)}% from ${formatINR(before.bestPrice)} to ${formatINR(price)}${where}.`;
      }
      return null;
    }

    case 'BACK_IN_STOCK':
      if (!before.inStock && product.inStock) {
        return `${product.name} is back in stock${price ? ` at ${formatINR(price)}` : ''}${where}.`;
      }
      return null;

    case 'ANY_PRICE_CHANGE':
      if (price && before.bestPrice && price !== before.bestPrice) {
        const direction = price < before.bestPrice ? 'dropped' : 'increased';
        return `${product.name} ${direction} from ${formatINR(before.bestPrice)} to ${formatINR(price)}${where}.`;
      }
      return null;

    default:
      return null;
  }
}

/** Evaluate every active alert on a product after a refresh and notify users. */
async function evaluate(product, before) {
  const rules = await AlertRule.find({ product: product._id, isActive: true }).populate('user', 'name email');

  for (const rule of rules) {
    if (!rule.user) continue;
    const message = checkRule(rule, product, before);
    if (!message) continue;

    const notification = await Notification.create({
      user: rule.user._id,
      product: product._id,
      alertRule: rule._id,
      message,
    });

    if (mailer.isConfigured()) {
      try {
        await mailer.sendMail({
          to: rule.user.email,
          subject: `Price alert: ${product.name}`,
          text: `Hi ${rule.user.name},\n\n${message}\n\nBuy here: ${product.bestUrl || 'see the app'}\n`,
        });
        notification.emailStatus = 'SENT';
      } catch (err) {
        console.error(`[alerts] Email to ${rule.user.email} failed: ${err.message}`);
        notification.emailStatus = 'FAILED';
      }
      await notification.save();
    }

    rule.lastTriggeredAt = new Date();
    rule.lastTriggeredPrice = product.bestPrice;
    await rule.save();
  }
}

module.exports = { evaluate, checkRule };
