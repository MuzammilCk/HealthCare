const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hospital = require('./models/Hospital');

dotenv.config();

const hospitals = [
  {
    name: 'Rajagiri Hospital',
    address: 'Chunangamvely, Aluva',
    phone: '+91-484-2708000',
    email: 'info@rajagirhospital.com',
    district: 'Ernakulam',
    city: 'Aluva',
    state: 'Kerala',
    pincode: '683112',
    registrationNumber: 'RH-ERN-001',
  },
  {
    name: 'Apollo Hospitals',
    address: 'Kunnumpuram, Edappally',
    phone: '+91-484-3068888',
    email: 'info@apollohospitals.com',
    district: 'Ernakulam',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682024',
    registrationNumber: 'AH-ERN-002',
  },
  {
    name: 'Amrita Institute of Medical Sciences',
    address: 'AIMS Ponekkara P.O',
    phone: '+91-484-2851234',
    email: 'contact@aimshospital.org',
    district: 'Ernakulam',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682041',
    registrationNumber: 'AIMS-ERN-003',
  },
  {
    name: 'Lakeshore Hospital',
    address: 'NH 47 Bypass, Nettoor',
    phone: '+91-484-2701032',
    email: 'info@lakeshorehospital.com',
    district: 'Ernakulam',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682040',
    registrationNumber: 'LH-ERN-004',
  },
  {
    name: 'KIMS Hospital',
    address: 'PB No.1, Anayara P.O',
    phone: '+91-471-3041400',
    email: 'info@kimstvm.com',
    district: 'Thiruvananthapuram',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    pincode: '695029',
    registrationNumber: 'KIMS-TVM-005',
  },
  {
    name: 'Sree Gokulam Medical College',
    address: 'Venjaramoodu, Trivandrum',
    phone: '+91-472-2805000',
    email: 'info@sgmc.ac.in',
    district: 'Thiruvananthapuram',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    pincode: '695607',
    registrationNumber: 'SGMC-TVM-006',
  },
  {
    name: 'MIMS Hospital',
    address: 'Mini Bypass Road, Govindapuram',
    phone: '+91-495-2358100',
    email: 'info@mimshospitals.com',
    district: 'Kozhikode',
    city: 'Kozhikode',
    state: 'Kerala',
    pincode: '673016',
    registrationNumber: 'MIMS-KZD-007',
  },
  {
    name: 'Baby Memorial Hospital',
    address: 'Indira Gandhi Road',
    phone: '+91-495-2736200',
    email: 'info@bmh.org.in',
    district: 'Kozhikode',
    city: 'Kozhikode',
    state: 'Kerala',
    pincode: '673004',
    registrationNumber: 'BMH-KZD-008',
  },
  {
    name: 'Aster Medcity',
    address: 'Kuttisahib Road, Cheranalloor',
    phone: '+91-484-6699999',
    email: 'info@astermedcity.com',
    district: 'Ernakulam',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682027',
    registrationNumber: 'AM-ERN-009',
  },
  {
    name: 'Lisie Hospital',
    address: 'Kaloor, Ernakulam',
    phone: '+91-484-2403001',
    email: 'info@lisiehospital.com',
    district: 'Ernakulam',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682018',
    registrationNumber: 'LIS-ERN-010',
  },
  {
    name: 'Believers Church Medical College Hospital',
    address: 'Kuttapuzha, Thiruvalla',
    phone: '+91-469-2750000',
    email: 'info@believersmedicalcollege.edu.in',
    district: 'Pathanamthitta',
    city: 'Thiruvalla',
    state: 'Kerala',
    pincode: '689103',
    registrationNumber: 'BCMC-PTM-011',
  },
  {
    name: 'Caritas Hospital',
    address: 'Thellakom P.O, Kottayam',
    phone: '+91-481-2597000',
    email: 'info@caritashospital.org',
    district: 'Kottayam',
    city: 'Kottayam',
    state: 'Kerala',
    pincode: '686630',
    registrationNumber: 'CH-KTM-012',
  },
  {
    name: 'Sunrise Hospital',
    address: 'Kakkanad, Kochi',
    phone: '+91-484-2426100',
    email: 'info@sunrisehospital.in',
    district: 'Ernakulam',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682030',
    registrationNumber: 'SH-ERN-013',
  },
  {
    name: 'PVS Memorial Hospital',
    address: 'Kaloor, Ernakulam',
    phone: '+91-484-2345001',
    email: 'info@pvsmemorialhospital.com',
    district: 'Ernakulam',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682017',
    registrationNumber: 'PVS-ERN-014',
  },
  {
    name: 'Mother Hospital',
    address: 'Olari, Thrissur',
    phone: '+91-487-2384100',
    email: 'info@motherhospital.in',
    district: 'Thrissur',
    city: 'Thrissur',
    state: 'Kerala',
    pincode: '680012',
    registrationNumber: 'MH-TSR-015',
  },
];

const seedHospitals = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for hospital seeding...');

    // Clear existing hospitals (optional - comment out if you want to keep existing)
    // await Hospital.deleteMany({});
    // console.log('Existing hospitals cleared');

    for (const hospitalData of hospitals) {
      // Check if hospital already exists
      const existing = await Hospital.findOne({ registrationNumber: hospitalData.registrationNumber });
      
      if (!existing) {
        await Hospital.create(hospitalData);
        console.log(`✓ Created: ${hospitalData.name} (${hospitalData.district})`);
      } else {
        console.log(`- Skipped: ${hospitalData.name} (already exists)`);
      }
    }

    console.log('\n=== Hospital seeding complete! ===');
    console.log(`Total hospitals in database: ${await Hospital.countDocuments()}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('An error occurred during seeding:', error);
    mongoose.connection.close();
  }
};

seedHospitals();
