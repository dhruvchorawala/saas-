const ScraperManager = require('./scrapers/ScraperManager');
const browserService = require('./scrapers/BrowserService');

async function runTest() {
  console.log('Testing Generic Adapter...');
  try {
    // Testing a generic site with meta tags
    const genericData = await ScraperManager.scrape('https://example.com');
    console.log('Generic Data Extracted:', genericData);
  } catch (err) {
    console.error('Failed Generic Scrape:', err.message);
  }

  // Close playwright when done testing
  await browserService.close();
  console.log('Test complete. Browser closed.');
}

runTest();
