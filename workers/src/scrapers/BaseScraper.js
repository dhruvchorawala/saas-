class BaseScraper {
  constructor(url, domain) {
    if (this.constructor === BaseScraper) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.url = url;
    this.domain = domain;
  }

  /**
   * Main method to be implemented by all adapters
   * @param {import('playwright').Page} page 
   * @param {import('cheerio').CheerioAPI} $ 
   */
  async extractData(page, $) {
    throw new Error("Method 'extractData()' must be implemented.");
  }

  // Utility functions for safe text extraction
  safeGetText($, selector) {
    try {
      const text = $(selector).first().text().trim();
      return text || null;
    } catch {
      return null;
    }
  }

  safeGetAttr($, selector, attr) {
    try {
      const val = $(selector).first().attr(attr);
      return val ? val.trim() : null;
    } catch {
      return null;
    }
  }

  parsePrice(priceString) {
    if (!priceString) return null;
    // Remove currency symbols, commas, and grab the first valid float
    const match = priceString.replace(/,/g, '').match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  }
}

module.exports = BaseScraper;
