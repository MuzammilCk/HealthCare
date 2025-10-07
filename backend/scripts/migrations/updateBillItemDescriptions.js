/*
  One-time migration:
  Update bill item descriptions from "(N for M)" to "(N times for M days)".

  Usage:
    NODE_ENV=production node backend/scripts/migrations/updateBillItemDescriptions.js
    or simply:
    node backend/scripts/migrations/updateBillItemDescriptions.js
*/

const mongoose = require('mongoose');
const Bill = require('../../models/Bill');

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/healthsync';

async function run() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const regex = /\((\d+)\s+for\s+(\d+)\)/; // matches "(3 for 10)"
  let updatedCount = 0;

  const cursor = Bill.find({ 'items.description': { $regex: regex } }).cursor();

  for await (const bill of cursor) {
    let changed = false;
    bill.items = bill.items.map((item) => {
      if (typeof item.description === 'string') {
        const match = item.description.match(regex);
        if (match) {
          const [, freq, duration] = match;
          const newDesc = item.description.replace(regex, `(${freq} times for ${duration} days)`);
          if (newDesc !== item.description) {
            changed = true;
            return { ...item.toObject(), description: newDesc };
          }
        }
      }
      return item;
    });

    if (changed) {
      await bill.save();
      updatedCount += 1;
      console.log(`Updated bill ${bill._id}`);
    }
  }

  console.log(`Migration complete. Bills updated: ${updatedCount}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});


