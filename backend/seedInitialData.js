const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Specialization = require('./models/Specialization');

// Load environment variables
dotenv.config();

// Simple logger for seed script
const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
  error: (msg, err) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err || '')
};

// --- Data to be added ---
const adminUser = {
  name: 'Admin User',
  email: 'admin@healthsync.io',
  password: 'password123', // You can change this later
  role: 'admin',
};

const specializationsToCreate = [
  { name: 'Cardiologist', description: 'Specializes in heart and blood vessel diseases.' },
  { name: 'Neurologist', description: 'Specializes in nervous system disorders.' },
  { name: 'Orthopedic Surgeon', description: 'Specializes in musculoskeletal system issues.' },
  { name: 'Dermatologist', description: 'Specializes in skin, hair, and nail conditions.' },
  { name: 'Pediatrician', description: 'Specializes in medical care for children.' },
];

// --- Seeding Logic ---
const seedDatabase = async () => {
  try {
    log.info('Starting initial data seeding...');
    
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    log.success('MongoDB connected for initial seeding');

    // 1. Create the Admin User
    try {
      const adminExists = await User.findOne({ email: adminUser.email });
      if (!adminExists) {
        await User.create(adminUser);
        log.success(`Admin user created with email: ${adminUser.email}`);
      } else {
        log.info(`Admin user with email ${adminUser.email} already exists`);
      }
    } catch (error) {
      log.error('Error creating admin user:', error);
      throw error;
    }

    // 2. Create the Specializations
    for (const specData of specializationsToCreate) {
      try {
        const specExists = await Specialization.findOne({ name: specData.name });
        if (!specExists) {
          await Specialization.create(specData);
          log.success(`Specialization '${specData.name}' created`);
        } else {
          log.info(`Specialization '${specData.name}' already exists`);
        }
      } catch (error) {
        log.error(`Error creating specialization '${specData.name}':`, error);
      }
    }

    log.success('Initial data seeding complete!');

  } catch (error) {
    log.error('Fatal error during seeding:', error);
    process.exit(1);
  } finally {
    // Disconnect from the database
    try {
      await mongoose.connection.close();
      log.info('MongoDB connection closed');
    } catch (error) {
      log.error('Error closing MongoDB connection:', error);
    }
  }
};

// Run the script
seedDatabase();