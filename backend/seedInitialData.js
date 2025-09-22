const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Specialization = require('./models/Specialization');

// Load environment variables
dotenv.config();

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
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for initial seeding...');

    // 1. Create the Admin User
    const adminExists = await User.findOne({ email: adminUser.email });
    if (!adminExists) {
      await User.create(adminUser);
      console.log(`[SUCCESS] Admin user created with email: ${adminUser.email}`);
    } else {
      console.log(`[INFO] Admin user with email ${adminUser.email} already exists.`);
    }

    // 2. Create the Specializations
    for (const specData of specializationsToCreate) {
      const specExists = await Specialization.findOne({ name: specData.name });
      if (!specExists) {
        await Specialization.create(specData);
        console.log(`[SUCCESS] Specialization '${specData.name}' created.`);
      } else {
        console.log(`[INFO] Specialization '${specData.name}' already exists.`);
      }
    }

    console.log('--- Initial data seeding complete! ---');

  } catch (error) {
    console.error('An error occurred during seeding:', error);
  } finally {
    // Disconnect from the database
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// Run the script
seedDatabase();