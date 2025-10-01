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

          // Find or assign a hospital based on district
          const Hospital = require('./models/Hospital');
          let hospital = await Hospital.findOne({ district: doc.district, isActive: true });
          
          if (!hospital) {
            // If no hospital found for district, use any active hospital
            hospital = await Hospital.findOne({ isActive: true });
            if (!hospital) {
              console.warn(`No active hospital found for Dr. ${doc.name}. Skipping.`);
              continue;
            }
          }

          // 2. Check if a doctor profile already exists for this user
          const doctorProfileExists = await Doctor.findOne({ userId: user._id });

          if (!doctorProfileExists) {
            // 3. Parse and convert availability from JSON string in CSV
            let parsedAvailability = [];
            if (doc.availability) {
              try {
                const rawAvailability = JSON.parse(doc.availability);
                // Convert startTime/endTime objects to time slot strings
                parsedAvailability = rawAvailability.map(daySlot => ({
                  day: daySlot.day,
                  slots: daySlot.slots.map(slot => {
                    // Generate hourly slots from startTime to endTime
                    const start = parseInt(slot.startTime.split(':')[0]);
                    const end = parseInt(slot.endTime.split(':')[0]);
                    const timeSlots = [];
                    for (let hour = start; hour < end; hour++) {
                      const startTime = `${hour.toString().padStart(2, '0')}:00`;
                      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
                      timeSlots.push(`${startTime}-${endTime}`);
                    }
                    return timeSlots;
                  }).flat()
                }));
              } catch (e) {
                console.warn(`Failed to parse availability for ${doc.name}:`, e.message);
                parsedAvailability = [];
              }
            }

            // Create the doctor profile with hospital assignment
            await Doctor.create({
              userId: user._id,
              hospitalId: hospital._id,
              specializationId: specialization._id,
              district: doc.district,
              bio: doc.bio,
              qualifications: doc.qualifications,
              languages: doc.languages ? doc.languages.split(',').map(lang => lang.trim()) : [],
              experienceYears: doc.experienceYears ? parseInt(doc.experienceYears, 10) : 0,
              location: doc.location,
              photoUrl: doc.photoUrl || '',
              availability: parsedAvailability,
              verificationStatus: doc.verificationStatus || 'Approved',
            });
            console.log(`✓ Doctor profile created for ${doc.name} at ${hospital.name}`);
          } else {
            // Update existing doctor's hospital and availability
            let parsedAvailability = [];
            if (doc.availability) {
              try {
                const rawAvailability = JSON.parse(doc.availability);
                // Convert startTime/endTime objects to time slot strings
                parsedAvailability = rawAvailability.map(daySlot => ({
                  day: daySlot.day,
                  slots: daySlot.slots.map(slot => {
                    // Generate hourly slots from startTime to endTime
                    const start = parseInt(slot.startTime.split(':')[0]);
                    const end = parseInt(slot.endTime.split(':')[0]);
                    const timeSlots = [];
                    for (let hour = start; hour < end; hour++) {
                      const startTime = `${hour.toString().padStart(2, '0')}:00`;
                      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
                      timeSlots.push(`${startTime}-${endTime}`);
                    }
                    return timeSlots;
                  }).flat()
                }));
              } catch (e) {
                console.warn(`Failed to parse availability for ${doc.name}:`, e.message);
              }
            }

            await Doctor.updateOne(
              { userId: user._id },
              { 
                $set: { 
                  hospitalId: hospital._id,
                  availability: parsedAvailability,
                  verificationStatus: doc.verificationStatus || 'Approved'
                } 
              }
            );
            console.log(`✓ Updated ${doc.name} - assigned to ${hospital.name}`);
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