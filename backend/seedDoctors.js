const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const csv = require('csv-parser');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Specialization = require('./models/Specialization');

dotenv.config();

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for doctor seeding...');

    const doctors = [];
    fs.createReadStream('./doctor.csv')
      .pipe(csv())
      .on('data', (row) => {
        doctors.push(row);
      })
      .on('end', async () => {
        for (const doc of doctors) {
          // Check if user already exists
          let user = await User.findOne({ email: doc.email });

          if (!user) {
            // 1. Create a new user for the doctor
            user = await User.create({
              name: doc.name,
              email: doc.email,
              password: doc.password || 'password123', // Use password from CSV or a default
              role: 'doctor',
              district: doc.district,
              photoUrl: doc.photoUrl || '',
            });
            console.log(`User created for ${doc.name}`);
          } else {
            console.log(`User for ${doc.name} already exists.`);
          }
          
          // Find the specialization ID
          const specialization = await Specialization.findOne({ name: doc.specializationName });
          if (!specialization) {
            console.warn(`Specialization '${doc.specializationName}' not found for Dr. ${doc.name}. Skipping.`);
            continue;
          }

          // 2. Check if a doctor profile already exists for this user
          const doctorProfileExists = await Doctor.findOne({ userId: user._id });

          if (!doctorProfileExists) {
            // 3. Create the doctor profile
            await Doctor.create({
              userId: user._id,
              specializationId: specialization._id,
              district: doc.district,
              bio: doc.bio,
              qualifications: doc.qualifications,
              languages: doc.languages ? doc.languages.split(',').map(lang => lang.trim()) : [],
              experienceYears: doc.experienceYears ? parseInt(doc.experienceYears, 10) : 0,
              location: doc.location,
              photoUrl: doc.photoUrl || '',
              availability: doc.availability ? [{ day: "Monday-Friday", slots: [doc.availability] }] : [],
              // --- THIS IS THE CHANGE ---
              // Read the verification status from the CSV, default to 'Pending' if not present
              verificationStatus: doc.verificationStatus || 'Pending',
            });
            console.log(`Doctor profile created for ${doc.name}`);
          } else {
            // --- OPTIONAL: Update existing doctors' verification status ---
            await Doctor.updateOne(
              { userId: user._id },
              { $set: { verificationStatus: doc.verificationStatus || 'Pending' } }
            );
            console.log(`Doctor profile for ${doc.name} already exists. Updated verification status.`);
          }
        }
        console.log('--- Doctor data seeding complete! ---');
        mongoose.connection.close();
      });
  } catch (error) {
    console.error('An error occurred during seeding:', error);
    mongoose.connection.close();
  }
};

seedDoctors();