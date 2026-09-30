# UPAI — Best prices across Indian stores

Compare live prices of popular brand products (smartphones, laptops, audio, wearables & tablets) on
**Amazon.in, Flipkart, Reliance Digital and Vijay Sales**. Browse a curated catalog or search any product /
paste a store link, see the cheapest in-stock store, price history per store, and set price-drop alerts.

100 % free and open source — no paid APIs, no Redis, no cloud account needed.
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it works.

## Requirements

- Node.js 20+ (tested with Node 24)
- MongoDB running locally (Community Server, free) — or Docker

## Run locally

```bash
# 1. Backend (http://localhost:5000)
cd backend
cp .env.example .env          # then set JWT_SECRET to any long random text
npm install                   # also downloads Chromium for Playwright (~150 MB, one time)
npm run dev

# 2. Frontend (http://localhost:3000) — in a second terminal
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

On the first start the backend adds the 62-product brand catalog and fetches every price from all four
stores. That takes about 8–10 minutes; the site shows "Fetching prices…" until each product is done.
After that, prices are re-checked automatically every 6 hours (`REFRESH_INTERVAL_HOURS`).

### Admin access

Register normally in the app, then:

```bash
cd backend
npm run make-admin -- you@example.com
```

Admins get an **Admin** menu with system numbers, users and live refresh jobs.

### Optional: email alerts

Alerts always appear in the app. To also email them (and send password-reset links), fill the `SMTP_*`
values in `backend/.env` — a free Gmail account with an App Password works (`smtp.gmail.com`, port 587).
Without SMTP, password-reset links are printed in the backend console.

## Useful commands

| Command (in `backend/`) | What it does |
|---|---|
| `npm test` | Unit tests for the product matcher |
| `npm run check-stores -- "Samsung Galaxy S25 256GB"` | Search all stores live and show what matches (no database needed) |
| `npm run check-stores -- --catalog [category]` | Check the whole catalog against the stores |
| `npm run seed` | Add catalog products to the database (also done on server start) |

## Docker (alternative)

```bash
docker compose up --build
```

Starts MongoDB, the backend and the frontend. Change `JWT_SECRET` in `docker-compose.yml` first.

## Project structure

```
backend/   Express API, price engine, store scrapers, scheduler (MongoDB)
frontend/  Next.js 14 + Tailwind + Recharts web app
docs/      Architecture notes
```
