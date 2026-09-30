const cheerio = require('cheerio');
const { fetchText, parsePrice } = require('../http');

const BASE = 'https://www.reliancedigital.in';

/** Parse a Reliance Digital search results page into listings. */
function parseResults(html) {
  const $ = cheerio.load(html);
  const listings = [];

  $('.product-card').each((_, el) => {
    const card = $(el);
    const title = card.find('.product-card-title').text().trim();
    const price = parsePrice(card.find('.price-container .price').first().text());
    const href = card.find('a.details-container').attr('href') || card.find('a[href*="/product/"]').attr('href');
    if (!title || !price || !href) return;

    const mrp = parsePrice(card.find('.mrp-amount').first().text());
    const img = card.find('.product-card-image img');

    listings.push({
      title,
      url: new URL(href.split('?')[0], BASE).toString(),
      image: img.attr('src') || null,
      price,
      mrp: mrp && mrp > price ? mrp : null,
      inStock: !/out of stock/i.test(card.text()),
    });
  });
  return listings;
}

module.exports = {
  key: 'reliance',
  name: 'Reliance Digital',
  domain: 'reliancedigital.in',
  minIntervalMs: 2000,

  async search(query) {
    const html = await fetchText(`${BASE}/products?q=${encodeURIComponent(query)}`);
    return parseResults(html);
  },

  parseResults,
};
