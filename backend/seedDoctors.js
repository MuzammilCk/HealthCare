const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const csv = require('csv-parser');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Specialization = require('./models/Specialization');

dotenv.config();

// Simple logger for seed script
const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
  error: (msg, err) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err || '')
};

const seedDoctors = async () => {
  try {
    log.info('Starting doctor seeding process...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log.success('MongoDB connected for doctor seeding');

    // Check if CSV file exists
    if (!fs.existsSync('./doctor.csv')) {
      log.error('doctor.csv file not found in backend directory');
      throw new Error('doctor.csv file not found');
    }

    const doctors = [];
    fs.createReadStream('./doctor.csv')
      .pipe(csv())
      .on('data', (row) => {
        doctors.push(row);
      })
      .on('error', (error) => {
        log.error('Error reading CSV file:', error);
        throw error;
      })
      .on('end', async () => {
        try {
          log.info(`Processing ${doctors.length} doctors from CSV...`);
          
          for (const doc of doctors) {
            try {
              // Validate required fields
              if (!doc.name || !doc.email || !doc.specializationName) {
                log.warn(`Skipping doctor with missing required fields: ${doc.name || 'Unknown'}`);
                continue;
              }

              // Check if user already exists
              let user = await User.findOne({ email: doc.email });

              if (!user) {
                // 1. Create a new user for the doctor
                user = await User.create({
                  name: doc.name,
                  email: doc.email,
                  password: doc.password || 'password123',
                  role: 'doctor',
                  district: doc.district,
                  photoUrl: doc.photoUrl || '',
                });
                log.success(`User created for ${doc.name}`);
              } else {
                log.info(`User for ${doc.name} already exists`);
              }
          
              // Find the specialization ID
              const specialization = await Specialization.findOne({ name: doc.specializationName });
              if (!specialization) {
                log.warn(`Specialization '${doc.specializationName}' not found for Dr. ${doc.name}. Skipping.`);
                continue;
              }

              // Find or assign a hospital based on district
              const Hospital = require('./models/Hospital');
              let hospital = await Hospital.findOne({ district: doc.district, isActive: true });
              
              if (!hospital) {
                // If no hospital found for district, use any active hospital
                hospital = await Hospital.findOne({ isActive: true });
                if (!hospital) {
                  log.warn(`No active hospital found for Dr. ${doc.name}. Skipping.`);
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
                    log.warn(`Failed to parse availability for ${doc.name}: ${e.message}`);
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
                log.success(`Doctor profile created for ${doc.name} at ${hospital.name}`);
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
                    log.warn(`Failed to parse availability for ${doc.name}: ${e.message}`);
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
                log.success(`Updated ${doc.name} - assigned to ${hospital.name}`);
              }
            } catch (docError) {
              log.error(`Error processing doctor ${doc.name}:`, docError);
            }
          }
          
          log.success('Doctor data seeding complete!');
          await mongoose.connection.close();
          log.info('MongoDB connection closed');
        } catch (processingError) {
          log.error('Error processing doctors:', processingError);
          await mongoose.connection.close();
          process.exit(1);
        }
      });
  } catch (error) {
    log.error('Fatal error during seeding:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDoctors();