const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const clearTransactionalData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Clearing transactional data only...\n');
    console.log('📌 Keeping: Users, Doctors, Hospitals, Specializations, Inventories\n');

    const db = mongoose.connection.db;

    // Collections to clear (transactional data)
    const collectionsToClean = [
      'appointments',
      'prescriptions',
      'bills',
      'notifications',
      'medicalhistories'
    ];

    let clearedCount = 0;

    for (let collectionName of collectionsToClean) {
      try {
        const collection = db.collection(collectionName);
        const result = await collection.deleteMany({});
        console.log(`   ✓ Cleared: ${collectionName} (${result.deletedCount} documents)`);
        clearedCount++;
      } catch (error) {
        console.log(`   ⚠ Collection not found: ${collectionName} (skipping)`);
      }
    }

    console.log('\n✅ Transactional data cleared successfully!');
    console.log(`📊 Cleared ${clearedCount} collections`);
    console.log('\n💡 Preserved data:');
    console.log('   • Users (patients, doctors, admins)');
    console.log('   • Doctors profiles');
    console.log('   • Hospitals');
    console.log('   • Specializations');
    console.log('   • Inventories\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearTransactionalData();
