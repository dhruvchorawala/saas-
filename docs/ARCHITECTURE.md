# UPAI — Architecture

UPAI is a price-comparison web app for popular brand products sold in India. For every product it
searches **Amazon.in, Flipkart, Reliance Digital and Vijay Sales**, keeps only listings that are the exact
same product and variant, and shows the cheapest store, the price history per store, and price alerts.

Everything is free and open source: Node.js, Express, MongoDB, Next.js, Playwright (Chromium), Cheerio.
No paid APIs, no Redis, no cloud services are required.

## 1. Components

```
 Browser ──► Next.js frontend (:3000) ──► Express REST API (:5000) ──► MongoDB
                                               │
                                               ├─ Refresh queue (in-process, 2 jobs at a time)
                                               ├─ Scheduler (re-checks every product every 6 h)
                                               └─ Price engine
                                                    ├─ Store adapters (HTTP + Cheerio, Playwright for Flipkart)
                                                    ├─ Matcher (is this listing the same product?)
                                                    └─ Alert service (in-app notifications, optional email)
```

| Part | Where | What it does |
|---|---|---|
| Store adapters | `backend/src/scrapers/stores/` | Search one store and return listings `{title, url, image, price, mrp, inStock}` |
| Rate limiter | `backend/src/scrapers/limiter.js` | Serialises requests per store with a minimum gap (1.5–3 s) |
| Headless browser | `backend/src/scrapers/browser.js` | Lazily started Chromium for Flipkart; closed after 2 idle minutes |
| Matcher | `backend/src/services/matcher.js` | Accepts a listing only if it is the same model and variant |
| Price engine | `backend/src/services/priceEngine.js` | Searches all stores, filters outliers, stores offers + history, updates best price |
| Refresh queue | `backend/src/services/refreshQueue.js` | De-duplicated job queue; user actions jump ahead of scheduled work |
| Scheduler | `backend/src/services/scheduler.js` | Queues products whose prices are older than `REFRESH_INTERVAL_HOURS` |
| Discovery | `backend/src/services/discoveryService.js` | Turns a search text or store link into a catalog product |
| Seed catalog | `backend/src/seed/catalog.js` | 62 curated products (smartphones, laptops, audio, wearables & tablets) |

## 2. How a price is found

1. The product's search text (e.g. `Samsung Galaxy S25 256GB`) is sent to each store's search page in parallel.
2. Each result title is checked by the **matcher**:
   - every model word must be present (`galaxy`, `s25`), and a bare model number must belong to the
     model name ("Pad **3**"), not to a spec ("Snapdragon 8 Gen 3");
   - no extra variant words (`pro`, `plus`, `ultra`, `fe`, `lite`, `cellular`, …) — so *iPhone 16* never matches *iPhone 16 Pro*;
   - storage must agree (128 GB never matches a 256 GB listing; RAM is ignored);
   - accessories ("Case for iPhone 16"), refurbished/renewed items and store display units are rejected;
   - a different brand in the title is rejected.
3. Prices far below (< 50 %) or above (> 180 %) the median of all matches are dropped as mismatches.
4. Per store, the best match is the in-stock, non-sponsored listing with the lowest price.
5. Offers and a `PriceHistory` row per store are saved; the product's `bestPrice`, `bestStore`,
   `highestPrice`, `priceChange` and `lowestEverPrice` are recomputed.
6. Active alerts on the product are evaluated and notifications are created.

If a store search fails (network error, captcha), the last good offer is kept for up to 48 h.
If none of the model's words match on the first search, a second search without the storage size is tried.

## 3. Data model (MongoDB)

- **User** — name, email, hashed password, role (`USER` / `ADMIN`)
- **Product** — catalog entry: name, brand, category, variant, searchQuery, unique `key`, origin (`CATALOG` / `USER`),
  best-price aggregates, `refreshStatus`, `lastCheckedAt`
- **Offer** — one per (product, store): status (`FOUND` / `NOT_FOUND` / `ERROR`), title, url, price, mrp, inStock
- **PriceHistory** — product, store, price, mrp, inStock, capturedAt
- **Watchlist** — user → product ids
- **AlertRule** — user, product, type (`TARGET_PRICE`, `PRICE_DROP_PERCENT`, `BACK_IN_STOCK`, `ANY_PRICE_CHANGE`), threshold
- **Notification** — user, product, message, read, emailStatus

## 4. REST API (`/api/v1`)

| Method & path | Access | Purpose |
|---|---|---|
| `POST /auth/register`, `POST /auth/login`, `GET /auth/logout`, `GET /auth/me` | public / user | Accounts (JWT in an httpOnly cookie) |
| `PUT /auth/updatedetails`, `PUT /auth/updatepassword` | user | Profile |
| `POST /auth/forgotpassword`, `PUT /auth/resetpassword/:token` | public | Password reset (email if SMTP is set, otherwise link printed in the server log) |
| `GET /products` | public | Browse: `search`, `category`, `brand`, `inStock`, `sort`, `page`, `limit` |
| `GET /products/facets` | public | Categories, brands, stores with counts |
| `GET /products/:id` | public | Product + offers from every store (+ watchlist/alerts when logged in) |
| `GET /products/:id/history` | public | Price history per store |
| `POST /products/discover` | user | `{ query }` or `{ url }` → find or add a product and fetch its prices |
| `POST /products/:id/refresh` | user | Re-check now (at most every 10 min) |
| `DELETE /products/:id` | admin | Remove a product and its data |
| `GET/POST /watchlist`, `DELETE /watchlist/:productId` | user | Watchlist |
| `GET/POST /alerts`, `PATCH/DELETE /alerts/:id` | user | Alert rules |
| `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/read-all` | user | Notifications |
| `GET /analytics/stats`, `GET /analytics/market` | public | Landing-page numbers, market analytics |
| `GET /analytics/dashboard` | user | Personal dashboard |
| `GET /admin/analytics`, `GET /admin/users`, `GET /admin/jobs`, `POST /admin/refresh-stale`, `POST /admin/refresh-all` | admin | Administration |
| `GET /health` | public | Database and queue status |

## 5. Security

- Passwords hashed with bcrypt; JWT in an httpOnly, SameSite=Lax cookie.
- The role is never taken from the registration request; admins are promoted with `npm run make-admin`.
- Helmet, express-mongo-sanitize, hpp, CORS limited to `CLIENT_URL`, rate limits on the API, auth and discovery.
- Search input is regex-escaped before querying MongoDB.

## 6. Limitations (worth mentioning in the report)

- Scraping depends on each store's page layout; if a store changes its HTML, its adapter needs updating.
  `npm run check-stores -- --catalog` shows at a glance which stores still work.
- Croma blocks automated access (HTTP 403 even for a real browser), so it is not included.
- Prices are list prices; bank offers, exchange discounts and coupons are not included.
- Windows laptops are sold in many configurations under one name, so catalog laptops pin the exact processor.
