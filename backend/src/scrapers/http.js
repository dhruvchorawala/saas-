const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-IN,en;q=0.9',
};

/**
 * GET a URL with browser-like headers and a hard timeout.
 * Returns the body as text; throws on non-2xx responses.
 */
async function fetchText(url, { headers = {}, timeoutMs = 20000 } = {}) {
  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, ...headers },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
  }
  return res.text();
}

async function fetchJson(url, options) {
  const text = await fetchText(url, {
    ...options,
    headers: { Accept: 'application/json', ...(options && options.headers) },
  });
  return JSON.parse(text);
}

/** "₹1,34,900.00" -> 134900 ; returns null when no number is present. */
function parsePrice(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = String(value).replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? Math.round(parseFloat(match[0])) : null;
}

module.exports = { fetchText, fetchJson, parsePrice, BROWSER_HEADERS };
