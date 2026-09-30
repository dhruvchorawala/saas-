const { fetchJson, parsePrice } = require('../http');

// Vijay Sales' website calls this public search endpoint from the browser.
const SEARCH_API = 'https://mdm.vijaysales.com/web/api/search/unbxd-search/v1';

/** Map the search API response into listings. */
function parseResults(json) {
  const products = (json && json.response && json.response.products) || [];
  return products
    .map(p => {
      const price = parsePrice(p.cityId_1_sellingPrice_unx_d ?? p.vsp ?? p.price);
      const mrp = parsePrice(p.mrp);
      return {
        title: p.title,
        url: p.productUrl,
        image: Array.isArray(p.imageUrl) ? p.imageUrl[0] : p.imageUrl || null,
        price,
        mrp: mrp && mrp > price ? mrp : null,
        inStock: p.cityId_1_status_unx_ts ? p.cityId_1_status_unx_ts !== 'Unavailable' : true,
      };
    })
    .filter(l => l.title && l.url && l.price);
}

module.exports = {
  key: 'vijaysales',
  name: 'Vijay Sales',
  domain: 'vijaysales.com',
  minIntervalMs: 1500,

  async search(query) {
    // The API expects paging params encoded inside q, exactly like the website sends them
    const q = encodeURIComponent(`${query}&page=1&rows=30`);
    const json = await fetchJson(`${SEARCH_API}?q=${q}&fq=`, {
      headers: { Origin: 'https://www.vijaysales.com', Referer: 'https://www.vijaysales.com/' },
    });
    return parseResults(json);
  },

  parseResults,
};
