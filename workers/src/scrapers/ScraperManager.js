const cheerio = require('cheerio');
const browserService = require('./BrowserService');
const { rawProductSchema } = require('../utils/schema');

// Adapters
const AmazonAdapter = require('./adapters/AmazonAdapter');
const GenericAdapter = require('./adapters/GenericAdapter');

class ScraperManager {
  static getDomain(url) {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return null;
    }
  }

  static getAdapter(url) {
    const domain = this.getDomain(url);
    if (!domain) throw new Error('Invalid URL');

    if (domain.includes('amazon.')) {
      return new AmazonAdapter(url, domain);
    }
    
    // Fallback
    return new GenericAdapter(url, domain);
  }

  static async scrape(url) {
    const adapter = this.getAdapter(url);
    let context, page;
    
    try {
      // Launch isolated browser context
      const browserData = await browserService.createPage();
      context = browserData.context;
      page = browserData.page;

      // Navigate with timeout and wait until network is mostly idle
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait a bit to let JS render on SPAs
      await page.waitForTimeout(2000);

      // Extract HTML and pass to cheerio for fast parsing
      const html = await page.content();
      const $ = cheerio.load(html);

      // Execute adapter-specific extraction
      const rawData = await adapter.extractData(page, $);

      // Validate against schema to ensure standard format
      const validatedData = rawProductSchema.parse(rawData);

      return validatedData;

    } catch (error) {
      console.error(`Scraping error for ${url}:`, error.message);
      throw error;
    } finally {
      if (context) {
        await context.close();
      }
    }
  }
}

module.exports = ScraperManager;
