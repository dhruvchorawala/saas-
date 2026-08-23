const { chromium } = require('playwright');

class BrowserService {
  constructor() {
    this.browser = null;
  }

  async launch() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      });
    }
    return this.browser;
  }

  async createPage() {
    await this.launch();
    
    // Create isolated context for each page to prevent cookie sharing
    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: false,
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    const page = await context.newPage();
    
    // Stealth evasion script
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    return { context, page };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new BrowserService();
