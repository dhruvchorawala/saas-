/**
 * Give an existing user the ADMIN role (register normally first).
 *
 *   npm run make-admin -- you@example.com
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const email = (process.argv[2] || '').toLowerCase().trim();
  if (!email) {
    console.log('Usage: npm run make-admin -- <email>');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/price_compare');
  const user = await User.findOneAndUpdate({ email }, { role: 'ADMIN' }, { returnDocument: 'after' });
  console.log(user ? `${user.email} is now an ADMIN.` : `No user found with email ${email}.`);
  await mongoose.disconnect();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
