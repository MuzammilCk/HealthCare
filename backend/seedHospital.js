require('dotenv').config();
const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const Doctor = require('./models/Doctor');
const Inventory = require('./models/Inventory');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create Hospital
    const hospital = await Hospital.create({
      name: 'City General Hospital',
      address: '123 Main Street, Thiruvananthapuram',
      phone: '0471-1234567',
      email: 'info@cityhospital.com',
      district: 'Thiruvananthapuram',
      city: 'Thiruvananthapuram',
      state: 'Kerala',
      pincode: '695001',
      registrationNumber: 'KL-TVM-001'
    });

    console.log('✅ Hospital created:', hospital.name);

    // Update all doctors to link to this hospital
    const result = await Doctor.updateMany(
      {},
      { hospitalId: hospital._id }
    );

    console.log(`✅ Updated ${result.modifiedCount} doctors with hospital link`);

    // Add sample inventory
    const medicines = [
      {
        hospitalId: hospital._id,
        medicineName: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        manufacturer: 'Generic Pharma',
        stockQuantity: 500,
        price: 500,  // ₹5.00 in paise
        unit: 'tablet',
        minStockLevel: 50,
        batchNumber: 'PARA2024001',
        expiryDate: new Date('2025-12-31')
      },
      {
        hospitalId: hospital._id,
        medicineName: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        manufacturer: 'Antibiotics Ltd',
        stockQuantity: 200,
        price: 1500,  // ₹15.00 in paise
        unit: 'capsule',
        minStockLevel: 30,
        batchNumber: 'AMOX2024002',
        expiryDate: new Date('2025-10-31')
      },
      {
        hospitalId: hospital._id,
        medicineName: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        manufacturer: 'Pain Relief Co',
        stockQuantity: 300,
        price: 800,  // ₹8.00 in paise
        unit: 'tablet',
        minStockLevel: 40,
        batchNumber: 'IBU2024003',
        expiryDate: new Date('2026-01-31')
      },
      {
        hospitalId: hospital._id,
        medicineName: 'Cetirizine 10mg',
        genericName: 'Cetirizine',
        manufacturer: 'Allergy Care',
        stockQuantity: 150,
        price: 300,  // ₹3.00 in paise
        unit: 'tablet',
        minStockLevel: 25,
        batchNumber: 'CET2024004',
        expiryDate: new Date('2025-11-30')
      },
      {
        hospitalId: hospital._id,
        medicineName: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        manufacturer: 'Gastro Pharma',
        stockQuantity: 180,
        price: 1200,  // ₹12.00 in paise
        unit: 'capsule',
        minStockLevel: 30,
        batchNumber: 'OME2024005',
        expiryDate: new Date('2025-09-30')
      },
      {
        hospitalId: hospital._id,
        medicineName: 'Azithromycin 500mg',
        genericName: 'Azithromycin',
        manufacturer: 'Antibiotics Ltd',
        stockQuantity: 120,
        price: 2500,  // ₹25.00 in paise
        unit: 'tablet',
        minStockLevel: 20,
        batchNumber: 'AZI2024006',
        expiryDate: new Date('2025-08-31')
      },
      {
        hospitalId: hospital._id,
        medicineName: 'Metformin 500mg',
        genericName: 'Metformin',
        manufacturer: 'Diabetes Care',
        stockQuantity: 250,
        price: 600,  // ₹6.00 in paise
        unit: 'tablet',
        minStockLevel: 35,
        batchNumber: 'MET2024007',
        expiryDate: new Date('2026-03-31')
      },
      {
        hospitalId: hospital._id,
        medicineName: 'Atorvastatin 10mg',
        genericName: 'Atorvastatin',
        manufacturer: 'Cardio Pharma',
        stockQuantity: 200,
        price: 1800,  // ₹18.00 in paise
        unit: 'tablet',
        minStockLevel: 30,
        batchNumber: 'ATO2024008',
        expiryDate: new Date('2025-12-31')
      },
      {
        hospitalId: hospital._id,
        medicineName: 'Cough Syrup 100ml',
        genericName: 'Dextromethorphan',
        manufacturer: 'Respiratory Care',
        stockQuantity: 80,
        price: 12000,  // ₹120.00 in paise
        unit: 'syrup',
        minStockLevel: 15,
        batchNumber: 'COUGH2024009',
        expiryDate: new Date('2025-07-31')
      },
      {
        hospitalId: hospital._id,
        medicineName: 'Vitamin D3 60000 IU',
        genericName: 'Cholecalciferol',
        manufacturer: 'Wellness Pharma',
        stockQuantity: 100,
        price: 3500,  // ₹35.00 in paise
        unit: 'capsule',
        minStockLevel: 20,
        batchNumber: 'VITD2024010',
        expiryDate: new Date('2026-06-30')
      }
    ];

    await Inventory.insertMany(medicines);
    console.log(`✅ Added ${medicines.length} medicines to inventory`);

    console.log('\n🎉 Seed data created successfully!');
    console.log('\nHospital Details:');
    console.log(`- Name: ${hospital.name}`);
    console.log(`- ID: ${hospital._id}`);
    console.log(`- Doctors linked: ${result.modifiedCount}`);
    console.log(`- Medicines in inventory: ${medicines.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
