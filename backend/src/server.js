const app = require('./app');
const connectDB = require('./config/db');
const { seedCatalog } = require('./seed');
const scheduler = require('./services/scheduler');
const { closeBrowser } = require('./scrapers/browser');

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set. Copy backend/.env.example to backend/.env first.');
    process.exit(1);
  }

  await connectDB();

  const added = await seedCatalog();
  if (added) console.log(`[seed] Added ${added} catalog product(s)`);

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  await scheduler.start();

  const shutdown = async () => {
    console.log('Shutting down...');
    await closeBrowser();
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

process.on('unhandledRejection', err => {
  console.error(`Unhandled rejection: ${err && err.stack ? err.stack : err}`);
});

start().catch(err => {
  console.error(err);
  process.exit(1);
});
