# Playwright's image ships Chromium and its system libraries (needed for the Flipkart scraper)
FROM mcr.microsoft.com/playwright:v1.55.0-noble

WORKDIR /usr/src/app

COPY package*.json ./
# Browsers are already in the image, so skip the postinstall download
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npm ci --omit=dev --ignore-scripts

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
