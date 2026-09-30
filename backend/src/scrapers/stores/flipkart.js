const cheerio = require('cheerio');
const { parsePrice } = require('../http');
const { renderPage } = require('../browser');

const BASE = 'https://www.flipkart.com';

/**
 * Parse a rendered Flipkart search page. Class names on Flipkart are
 * obfuscated and change often, so we rely on stable signals instead:
 * product cards carry data-id, links contain "/p/", and prices are "₹" text nodes.
 */
function parseResults(html) {
  const $ = cheerio.load(html);
  const listings = [];
  const seen = new Set();

  $('div[data-id]').each((_, el) => {
    const card = $(el);
    const link = card.find('a[href*="/p/"]').first();
    const href = link.attr('href');
    if (!href) return;

    const url = new URL(href, BASE);
    const pid = url.searchParams.get('pid') || url.pathname;
    if (seen.has(pid)) return;
    seen.add(pid);

    const title = (
      card.find('a[title]').first().attr('title') ||
      card.find('img[alt]').first().attr('alt') ||
      link.text()
    ).trim();

    // Collect the rupee amounts in visual order: selling price comes first, then MRP
    const amounts = [];
    card.find('*').contents().each((_, node) => {
      if (node.type !== 'text') return;
      const text = $(node).text().trim();
      if (/^₹[\d,]+(\.\d+)?$/.test(text)) amounts.push(parsePrice(text));
    });
    const price = amounts[0];
    if (!title || !price) return;
    const mrp = amounts.find(a => a > price && a < price * 3) || null;

    const cardText = card.text();
    listings.push({
      title,
      url: `${BASE}${url.pathname}${url.searchParams.get('pid') ? `?pid=${url.searchParams.get('pid')}` : ''}`,
      image: card.find('img').first().attr('src') || null,
      price,
      mrp,
      inStock: !/Currently unavailable|Sold Out|Coming Soon/i.test(cardText),
      sponsored: /\bSponsored\b/i.test(cardText),
    });
  });
  return listings;
}

module.exports = {
  key: 'flipkart',
  name: 'Flipkart',
  domain: 'flipkart.com',
  minIntervalMs: 2500,

  async search(query) {
    const html = await renderPage(`${BASE}/search?q=${encodeURIComponent(query)}`, {
      waitForSelector: 'div[data-id]',
    });
    return parseResults(html);
  },

  parseResults,
};
