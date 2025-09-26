const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./models/Doctor');

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const result = await Doctor.updateMany({}, { $set: { kycVerified: 'verified' } });
    console.log(`Updated ${result.modifiedCount || result.nModified || 0} doctor(s) to kycVerified=verified`);
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();


