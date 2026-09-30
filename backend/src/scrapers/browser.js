const { BROWSER_HEADERS } = require('./http');

// Headless Chromium (Playwright) for stores that only render results with JavaScript.
// The browser is launched lazily and closed again after a period of inactivity.
const IDLE_CLOSE_MS = 2 * 60 * 1000;

let browserPromise = null;
let idleTimer = null;
let openPages = 0;

async function getBrowser() {
  if (!browserPromise) {
    const { chromium } = require('playwright');
    browserPromise = chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    }).catch(err => {
      browserPromise = null;
      throw new Error(`Could not start headless browser (run "npx playwright install chromium"): ${err.message}`);
    });
  }
  return browserPromise;
}

function scheduleIdleClose() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (openPages === 0) closeBrowser();
  }, IDLE_CLOSE_MS);
  idleTimer.unref();
}

async function closeBrowser() {
  clearTimeout(idleTimer);
  if (!browserPromise) return;
  const pending = browserPromise;
  browserPromise = null;
  try {
    const browser = await pending;
    await browser.close();
  } catch {
    // already closed or never started
  }
}

/**
 * Load a page in a fresh browser context and return the rendered HTML.
 * @param {string} url
 * @param {{ waitForSelector?: string, timeoutMs?: number }} options
 */
async function renderPage(url, { waitForSelector, timeoutMs = 30000 } = {}) {
  const browser = await getBrowser();
  openPages++;
  const context = await browser.newContext({
    userAgent: BROWSER_HEADERS['User-Agent'],
    locale: 'en-IN',
    viewport: { width: 1366, height: 900 },
  });
  try {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
    // Skip heavy assets we never read
    await context.route('**/*', route => {
      const type = route.request().resourceType();
      return ['image', 'media', 'font'].includes(type) ? route.abort() : route.continue();
    });

    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    if (response && response.status() >= 400) {
      throw new Error(`HTTP ${response.status()} from ${new URL(url).hostname}`);
    }
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 15000 }).catch(() => {});
    }
    return await page.content();
  } finally {
    await context.close().catch(() => {});
    openPages--;
    scheduleIdleClose();
  }
}

module.exports = { renderPage, closeBrowser };
