require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

const verifyImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check User model
    console.log('=== CHECKING USER MODEL ===');
    const users = await User.find({ role: 'doctor' }).limit(5);
    users.forEach(user => {
      console.log(`${user.name}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  PhotoURL: ${user.photoUrl || 'MISSING'}`);
      console.log('');
    });

    // Check Doctor model
    console.log('\n=== CHECKING DOCTOR MODEL ===');
    const doctors = await Doctor.find().populate('userId', 'name email').limit(5);
    doctors.forEach(doc => {
      console.log(`${doc.userId?.name || 'Unknown'}:`);
      console.log(`  PhotoURL: ${doc.photoUrl || 'MISSING'}`);
      console.log(`  Verification: ${doc.verificationStatus}`);
      console.log('');
    });

    // Count doctors with/without photos
    console.log('\n=== STATISTICS ===');
    const totalDoctors = await Doctor.countDocuments();
    const doctorsWithPhotos = await Doctor.countDocuments({ photoUrl: { $exists: true, $ne: '' } });
    const usersWithPhotos = await User.countDocuments({ role: 'doctor', photoUrl: { $exists: true, $ne: '' } });

    console.log(`Total Doctors: ${totalDoctors}`);
    console.log(`Doctors with photoUrl: ${doctorsWithPhotos}`);
    console.log(`Users (doctors) with photoUrl: ${usersWithPhotos}`);
    console.log(`Missing photos: ${totalDoctors - doctorsWithPhotos}`);

    await mongoose.connection.close();
    console.log('\n✅ Verification complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyImages();
