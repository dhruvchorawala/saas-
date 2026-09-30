const cheerio = require('cheerio');
const { fetchText, parsePrice } = require('../http');

const BASE = 'https://www.amazon.in';

/** Parse an Amazon.in search results page into listings. */
function parseResults(html) {
  const $ = cheerio.load(html);

  if ($('form[action="/errors/validateCaptcha"]').length || /Robot Check/i.test($('title').text())) {
    throw new Error('Amazon asked for a captcha (temporarily blocked)');
  }

  const listings = [];
  $('div[data-component-type="s-search-result"]').each((_, el) => {
    const card = $(el);
    const asin = card.attr('data-asin');
    if (!asin) return;

    // Brand and title live in separate spans; join them with spaces
    const titleParts = card.find('[data-cy="title-recipe"] span')
      .map((_, span) => $(span).text().trim())
      .get()
      .filter(text => text && !/Sponsored|seeing this ad|^Let us know$/i.test(text));
    const title = [...new Set(titleParts)].join(' ') || card.find('h2').text().trim();

    const price = parsePrice(card.find('.a-price:not(.a-text-price) .a-offscreen').first().text());
    if (!title || !price) return; // no buyable offer shown

    const mrp = parsePrice(card.find('.a-price.a-text-price .a-offscreen').first().text());
    const cardText = card.text();

    listings.push({
      title,
      url: `${BASE}/dp/${asin}`,
      image: card.find('img.s-image').attr('src') || null,
      price,
      mrp: mrp && mrp > price ? mrp : null,
      inStock: !/Currently unavailable/i.test(cardText),
      sponsored: /\bSponsored\b/.test(cardText),
    });
  });
  return listings;
}

module.exports = {
  key: 'amazon',
  name: 'Amazon.in',
  domain: 'amazon.in',
  minIntervalMs: 3000,

  async search(query) {
    const html = await fetchText(`${BASE}/s?k=${encodeURIComponent(query)}`);
    return parseResults(html);
  },

  parseResults,
};
