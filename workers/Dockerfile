# We must use the official playwright image to ensure browsers run properly
FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "src/index.js"]
