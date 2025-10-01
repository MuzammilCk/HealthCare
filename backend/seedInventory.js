const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hospital = require('./models/Hospital');
const Inventory = require('./models/Inventory');

dotenv.config();

// Common medicines list with details
const medicinesList = [
  // Pain Relievers (Analgesics)
  { name: 'Paracetamol 500mg', generic: 'Paracetamol', manufacturer: 'Cipla', price: 500, unit: 'tablet', category: 'Analgesic' },
  { name: 'Crocin 650mg', generic: 'Paracetamol', manufacturer: 'GSK', price: 800, unit: 'tablet', category: 'Analgesic' },
  { name: 'Ibuprofen 400mg', generic: 'Ibuprofen', manufacturer: 'Abbott', price: 1200, unit: 'tablet', category: 'Analgesic' },
  { name: 'Brufen 400mg', generic: 'Ibuprofen', manufacturer: 'Abbott', price: 1500, unit: 'tablet', category: 'Analgesic' },
  { name: 'Diclofenac 50mg', generic: 'Diclofenac', manufacturer: 'Novartis', price: 1000, unit: 'tablet', category: 'Analgesic' },
  { name: 'Voveran 50mg', generic: 'Diclofenac', manufacturer: 'Novartis', price: 1200, unit: 'tablet', category: 'Analgesic' },
  { name: 'Aspirin 75mg', generic: 'Aspirin', manufacturer: 'Bayer', price: 600, unit: 'tablet', category: 'Analgesic' },
  { name: 'Ecosprin 75mg', generic: 'Aspirin', manufacturer: 'USV', price: 800, unit: 'tablet', category: 'Analgesic' },
  
  // Antibiotics
  { name: 'Amoxicillin 500mg', generic: 'Amoxicillin', manufacturer: 'Cipla', price: 1500, unit: 'capsule', category: 'Antibiotic' },
  { name: 'Mox 500mg', generic: 'Amoxicillin', manufacturer: 'Ranbaxy', price: 1800, unit: 'capsule', category: 'Antibiotic' },
  { name: 'Azithromycin 500mg', generic: 'Azithromycin', manufacturer: 'Pfizer', price: 2500, unit: 'tablet', category: 'Antibiotic' },
  { name: 'Azee 500mg', generic: 'Azithromycin', manufacturer: 'Cipla', price: 2800, unit: 'tablet', category: 'Antibiotic' },
  { name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin', manufacturer: 'Ranbaxy', price: 2000, unit: 'tablet', category: 'Antibiotic' },
  { name: 'Cifran 500mg', generic: 'Ciprofloxacin', manufacturer: 'Ranbaxy', price: 2200, unit: 'tablet', category: 'Antibiotic' },
  { name: 'Doxycycline 100mg', generic: 'Doxycycline', manufacturer: 'Sun Pharma', price: 1800, unit: 'capsule', category: 'Antibiotic' },
  { name: 'Metronidazole 400mg', generic: 'Metronidazole', manufacturer: 'Abbott', price: 1000, unit: 'tablet', category: 'Antibiotic' },
  { name: 'Flagyl 400mg', generic: 'Metronidazole', manufacturer: 'Abbott', price: 1200, unit: 'tablet', category: 'Antibiotic' },
  
  // Cardiovascular Drugs
  { name: 'Atorvastatin 10mg', generic: 'Atorvastatin', manufacturer: 'Pfizer', price: 3000, unit: 'tablet', category: 'Cardiovascular' },
  { name: 'Lipitor 10mg', generic: 'Atorvastatin', manufacturer: 'Pfizer', price: 3500, unit: 'tablet', category: 'Cardiovascular' },
  { name: 'Amlodipine 5mg', generic: 'Amlodipine', manufacturer: 'Cipla', price: 1500, unit: 'tablet', category: 'Cardiovascular' },
  { name: 'Amlong 5mg', generic: 'Amlodipine', manufacturer: 'Micro Labs', price: 1800, unit: 'tablet', category: 'Cardiovascular' },
  { name: 'Metoprolol 50mg', generic: 'Metoprolol', manufacturer: 'AstraZeneca', price: 2000, unit: 'tablet', category: 'Cardiovascular' },
  { name: 'Clopidogrel 75mg', generic: 'Clopidogrel', manufacturer: 'Sanofi', price: 4000, unit: 'tablet', category: 'Cardiovascular' },
  { name: 'Clopilet 75mg', generic: 'Clopidogrel', manufacturer: 'Sun Pharma', price: 4500, unit: 'tablet', category: 'Cardiovascular' },
  { name: 'Ramipril 5mg', generic: 'Ramipril', manufacturer: 'Aventis', price: 2500, unit: 'tablet', category: 'Cardiovascular' },
  { name: 'Cardace 5mg', generic: 'Ramipril', manufacturer: 'Aventis', price: 2800, unit: 'tablet', category: 'Cardiovascular' },
  { name: 'Telmisartan 40mg', generic: 'Telmisartan', manufacturer: 'Glenmark', price: 3000, unit: 'tablet', category: 'Cardiovascular' },
  { name: 'Telma 40mg', generic: 'Telmisartan', manufacturer: 'Glenmark', price: 3200, unit: 'tablet', category: 'Cardiovascular' },
  
  // Antidiabetic Drugs
  { name: 'Metformin 500mg', generic: 'Metformin', manufacturer: 'USV', price: 1000, unit: 'tablet', category: 'Antidiabetic' },
  { name: 'Glycomet 500mg', generic: 'Metformin', manufacturer: 'USV', price: 1200, unit: 'tablet', category: 'Antidiabetic' },
  { name: 'Glimepiride 1mg', generic: 'Glimepiride', manufacturer: 'Aventis', price: 1500, unit: 'tablet', category: 'Antidiabetic' },
  { name: 'Amaryl 1mg', generic: 'Glimepiride', manufacturer: 'Aventis', price: 1800, unit: 'tablet', category: 'Antidiabetic' },
  { name: 'Vildagliptin 50mg', generic: 'Vildagliptin', manufacturer: 'Novartis', price: 3500, unit: 'tablet', category: 'Antidiabetic' },
  { name: 'Galvus Met 50/500mg', generic: 'Vildagliptin+Metformin', manufacturer: 'Novartis', price: 4000, unit: 'tablet', category: 'Antidiabetic' },
  
  // Gastrointestinal Drugs
  { name: 'Pantoprazole 40mg', generic: 'Pantoprazole', manufacturer: 'Sun Pharma', price: 1500, unit: 'tablet', category: 'Gastrointestinal' },
  { name: 'Pan 40mg', generic: 'Pantoprazole', manufacturer: 'Alkem', price: 1800, unit: 'tablet', category: 'Gastrointestinal' },
  { name: 'Pantocid 40mg', generic: 'Pantoprazole', manufacturer: 'Sun Pharma', price: 2000, unit: 'tablet', category: 'Gastrointestinal' },
  { name: 'Domperidone 10mg', generic: 'Domperidone', manufacturer: 'Cipla', price: 800, unit: 'tablet', category: 'Gastrointestinal' },
  { name: 'Domstal 10mg', generic: 'Domperidone', manufacturer: 'Torrent', price: 1000, unit: 'tablet', category: 'Gastrointestinal' },
  { name: 'Ondansetron 4mg', generic: 'Ondansetron', manufacturer: 'Alkem', price: 1500, unit: 'tablet', category: 'Gastrointestinal' },
  { name: 'Emeset 4mg', generic: 'Ondansetron', manufacturer: 'Cipla', price: 1800, unit: 'tablet', category: 'Gastrointestinal' },
  { name: 'Loperamide 2mg', generic: 'Loperamide', manufacturer: 'Johnson & Johnson', price: 1200, unit: 'capsule', category: 'Gastrointestinal' },
  { name: 'Bisacodyl 5mg', generic: 'Bisacodyl', manufacturer: 'Boehringer', price: 800, unit: 'tablet', category: 'Gastrointestinal' },
  
  // Respiratory Drugs
  { name: 'Salbutamol Inhaler', generic: 'Salbutamol', manufacturer: 'Cipla', price: 15000, unit: 'inhaler', category: 'Respiratory' },
  { name: 'Asthalin Inhaler', generic: 'Salbutamol', manufacturer: 'Cipla', price: 18000, unit: 'inhaler', category: 'Respiratory' },
  { name: 'Cetirizine 10mg', generic: 'Cetirizine', manufacturer: 'GSK', price: 500, unit: 'tablet', category: 'Respiratory' },
  { name: 'Cetzine 10mg', generic: 'Cetirizine', manufacturer: 'Dr Reddys', price: 600, unit: 'tablet', category: 'Respiratory' },
  { name: 'Montelukast 10mg', generic: 'Montelukast', manufacturer: 'Cipla', price: 2000, unit: 'tablet', category: 'Respiratory' },
  { name: 'Montair 10mg', generic: 'Montelukast', manufacturer: 'Cipla', price: 2200, unit: 'tablet', category: 'Respiratory' },
  { name: 'Levocetirizine 5mg', generic: 'Levocetirizine', manufacturer: 'Sun Pharma', price: 800, unit: 'tablet', category: 'Respiratory' },
  { name: 'Levocet 5mg', generic: 'Levocetirizine', manufacturer: 'Sun Pharma', price: 1000, unit: 'tablet', category: 'Respiratory' },
  
  // Vitamins & Supplements
  { name: 'Vitamin D3 60000 IU', generic: 'Cholecalciferol', manufacturer: 'Sun Pharma', price: 3000, unit: 'capsule', category: 'Vitamin' },
  { name: 'Vitamin B12 1500mcg', generic: 'Methylcobalamin', manufacturer: 'Abbott', price: 2500, unit: 'tablet', category: 'Vitamin' },
  { name: 'Folic Acid 5mg', generic: 'Folic Acid', manufacturer: 'Cipla', price: 500, unit: 'tablet', category: 'Vitamin' },
  { name: 'Shelcal 500mg', generic: 'Calcium+Vitamin D3', manufacturer: 'Torrent', price: 1500, unit: 'tablet', category: 'Vitamin' },
  { name: 'Calcium Carbonate 500mg', generic: 'Calcium Carbonate', manufacturer: 'USV', price: 1200, unit: 'tablet', category: 'Vitamin' },
  { name: 'Feronia XT', generic: 'Iron+Folic Acid', manufacturer: 'Emcure', price: 1800, unit: 'tablet', category: 'Vitamin' },
  { name: 'Multivitamin Syrup', generic: 'Multivitamin', manufacturer: 'Abbott', price: 12000, unit: 'syrup', category: 'Vitamin' },
];

const getRandomStock = () => Math.floor(Math.random() * 400) + 100; // 100-500
const getRandomMinStock = () => Math.floor(Math.random() * 40) + 10; // 10-50
const getRandomExpiryDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + Math.floor(Math.random() * 24) + 12); // 12-36 months from now
  return date;
};

const generateBatchNumber = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}-${numbers}`;
};

const seedInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for inventory seeding...\n');

    // Get all hospitals
    const hospitals = await Hospital.find({ isActive: true });
    
    if (hospitals.length === 0) {
      console.error('No hospitals found! Please run seedHospitals.js first.');
      mongoose.connection.close();
      return;
    }

    console.log(`Found ${hospitals.length} hospitals\n`);

    let totalAdded = 0;
    let totalSkipped = 0;

    // Add medicines to each hospital
    for (const hospital of hospitals) {
      console.log(`\n📦 Seeding inventory for: ${hospital.name}`);
      console.log('─'.repeat(60));

      // Each hospital gets 30-40 random medicines from the list
      const numMedicines = Math.floor(Math.random() * 11) + 30; // 30-40 medicines
      const shuffled = [...medicinesList].sort(() => 0.5 - Math.random());
      const selectedMedicines = shuffled.slice(0, numMedicines);

      for (const medicine of selectedMedicines) {
        try {
          // Check if medicine already exists for this hospital
          const existing = await Inventory.findOne({
            hospitalId: hospital._id,
            medicineName: medicine.name,
          });

          if (existing) {
            totalSkipped++;
            continue;
          }

          // Create inventory item
          await Inventory.create({
            hospitalId: hospital._id,
            medicineName: medicine.name,
            genericName: medicine.generic,
            manufacturer: medicine.manufacturer,
            stockQuantity: getRandomStock(),
            price: medicine.price,
            unit: medicine.unit,
            batchNumber: generateBatchNumber(),
            expiryDate: getRandomExpiryDate(),
            minStockLevel: getRandomMinStock(),
            notes: `${medicine.category} medication`,
            lastRestocked: new Date(),
            isActive: true,
          });

          totalAdded++;
          process.stdout.write('.');
        } catch (err) {
          if (err.code === 11000) {
            totalSkipped++;
          } else {
            console.error(`\n❌ Error adding ${medicine.name}:`, err.message);
          }
        }
      }

      const hospitalCount = await Inventory.countDocuments({ hospitalId: hospital._id });
      console.log(`\n✓ ${hospital.name}: ${hospitalCount} medicines in inventory`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Inventory Seeding Summary:');
    console.log('='.repeat(60));
    console.log(`✓ Total medicines added: ${totalAdded}`);
    console.log(`- Total skipped (duplicates): ${totalSkipped}`);
    console.log(`📦 Total inventory items: ${await Inventory.countDocuments()}`);
    console.log(`🏥 Hospitals with inventory: ${hospitals.length}`);
    console.log('='.repeat(60));

    mongoose.connection.close();
  } catch (error) {
    console.error('\n❌ An error occurred during seeding:', error);
    mongoose.connection.close();
  }
};

seedInventory();
