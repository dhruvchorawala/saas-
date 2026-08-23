# Universal Price & Availability Intelligence SaaS

## A. Project Overview
A SaaS platform allowing users to track product prices and availability across multiple e-commerce sources. The system will ingest product URLs, periodically scrape data, detect changes, notify users, and provide analytical dashboards comparing historical prices and seller options.

## B. Functional Requirements
1. Users can sign up, log in, and manage their profiles.
2. Users can submit product URLs or IDs for tracking.
3. System automatically extracts product details (price, availability, title, images) from supported sites.
4. System tracks historical price changes and availability status.
5. Users can set custom price drop alerts or availability alerts.
6. System sends notifications (Email, Telegram/WhatsApp) based on user preferences.
7. Analytics dashboard to view historical price charts (via Recharts) and compare sellers.
8. Admin dashboard to manage users, monitor system health, and manage scraper configurations.

## C. Non-Functional Requirements
1. **Scalability**: Capable of handling thousands of product links and concurrent scraping tasks.
2. **Reliability**: Resilient scraper that handles rate limits, captchas, and temporary failures using retries and queues.
3. **Performance**: Dashboard API should load in < 2 seconds. Background tasks must process asynchronously without blocking the main API thread.
4. **Security**: JWT-based authentication, password hashing, and rate-limiting on public API endpoints.
5. **Modularity**: The scraper engine must be decoupled, making it trivial to add new site scrapers without modifying core business logic.

## D. User/Admin Roles
- **User (Standard)**: Can add a limited number of tracked products, view basic dashboards, configure personal alerts.
- **User (Premium)**: Can track unlimited products, higher frequency of tracking (e.g., hourly), advanced analytics.
- **Admin**: Can view all users, manage subscriptions, monitor queue health, view system logs, enable/disable specific site scrapers.

## E. High-Level Architecture
1. **Client (Web App)** -> Next.js / React
2. **Load Balancer / Nginx** -> Routes traffic securely.
3. **REST API (Node.js/Express)** -> Handles user interactions, CRUD, and job delegation.
4. **Database (MongoDB)** -> Persistent storage for users, products, price histories, and alerts.
5. **Task Queue (Redis/BullMQ)** -> Manages delayed, recurring, and asynchronous jobs.
6. **Scraper Workers (Node.js + Playwright)** -> Independent worker processes fetching and parsing product pages.
7. **Notification Service** -> Listens to price change events and dispatches alerts via external APIs.

## F. Detailed Component Architecture
1. **Frontend (Next.js)**: SSR/SSG for SEO-friendly landing pages, Client-side rendering for the logged-in dashboard.
2. **Backend API (Express.js)**: Stateless API. Handles authentication, user management, and triggers tracking jobs.
3. **Queue Manager (BullMQ)**: Configured with Redis to manage recurring scraping jobs, retry logic with backoff, and delayed tasks.
4. **Scraping Engine (Playwright)**: Headless browser automation. Engineered to use proxy rotation, randomized user agents, and stealth plugins to avoid bot mitigation.
5. **Data Normalization Layer**: Standardizes scraped unstructured data (e.g., converts price strings to floats, standardizes currency codes).
6. **Notification Engine**: Evaluates user alert thresholds upon receiving a data change event, and dispatches via SendGrid (Email) or Twilio/Telegram bots.

## G. Data Flow
1. User submits a product URL via the Frontend.
2. API validates the request, saves the initial product record in MongoDB, and enqueues a "scrape" job in BullMQ.
3. A Scraper Worker picks up the job from Redis, fetches the page using Playwright, extracts data, and normalizes it.
4. Worker sends extracted data back to the API layer.
5. API compares new data with the previous DB record. If the price or availability changed:
   - A new `PriceHistory` record is inserted.
   - An event is published to the Notification queue.
6. Notification Service processes the event, checks active `Alerts`, and sends notifications to the relevant users.

## H. Module Breakdown
- **Auth Module**: Registration, login, password reset, JWT verification middleware.
- **Product Module**: Product CRUD, search, history retrieval.
- **Scraper Module**: Orchestrator, strategy pattern for site-specific parsers, proxy manager.
- **Alert Module**: Alert creation, threshold evaluation, notification dispatch.
- **Analytics Module**: Data aggregation for Recharts (e.g., daily average prices).

## I. Folder Structure
The repository is structured as a monorepo for easy navigation:
```
/
├── frontend/                 # Next.js Application
├── backend/                  # Express.js REST API
├── workers/                  # Redis/BullMQ Scraper & Notification Workers
├── docs/                     # Architecture & API documentation
└── docker-compose.yml        # Local infrastructure (Redis, MongoDB)
```

## J. Database Planning (MongoDB)
- **Users**: `_id`, `email`, `passwordHash`, `role`, `preferences`, `createdAt`
- **Products**: `_id`, `url`, `domain`, `title`, `currentPrice`, `currency`, `availability`, `imageUrl`, `lastScrapedAt`
- **PriceHistories**: `_id`, `productId`, `price`, `availability`, `timestamp`
- **Alerts**: `_id`, `userId`, `productId`, `targetPrice`, `type`, `status`

## K. API Planning
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **Products**: `GET /api/products`, `POST /api/products`
- **History**: `GET /api/products/:id/history`
- **Alerts**: `POST /api/alerts`, `GET /api/alerts`
- **Analytics**: `GET /api/analytics/dashboard`

## L. Queue/Worker Planning
- **Scrape Queue**: Handles jobs with payload `{ productId, url, domain }`. Configured for recurring runs.
- **Notification Queue**: Handles jobs with payload `{ alertId, message, channel, userId }`.
- Workers will operate as independent Node.js processes.

## M. Security Architecture
- Passwords hashed with `bcrypt`.
- JWT for stateless authentication; short expiry with secure `HttpOnly` refresh tokens.
- CORS strictly configured for the specific frontend origin.
- Rate limiting (`express-rate-limit`) on heavy API endpoints.
- `Helmet.js` for securing HTTP headers.
- Input validation using `Joi` or `Zod`.

## N. Scalability Strategy
- **Horizontal Scaling**: Backend API and Scraper Workers scale horizontally.
- **Proxy Management**: Integration with rotating residential proxies to avoid IP bans.
- **Microservices Path**: Scraper workers can be easily extracted into separate repositories if needed.

## O. Development Roadmap
- **Phase 1 (Completed)**: Architecture & Project Setup.
- **Phase 2**: Auth & Core REST API CRUD.
- **Phase 3**: Playwright Scraping Engine & BullMQ Redis integration.
- **Phase 4**: Notification Engine.
- **Phase 5**: Frontend Web App Dashboard.
- **Phase 6**: Testing, Optimization & Deployment.
