require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

const femaleDoctors = [
  'Dr. Anjali Nair', 'Dr. Priya Varma', 'Dr. Lakshmi Pillai', 'Dr. Fatima Rasheed',
  'Dr. Susan Varghese', 'Dr. Deepa Krishnan', 'Dr. Meera Menon', 'Dr. Rekha Nair',
  'Dr. Divya Mathew', 'Dr. Asha Varghese', 'Dr. Gita Gopinath', 'Dr. Renuka Devi',
  'Dr. Maya Pillai', 'Dr. Sreelatha Namboothiri', 'Dr. Parvathy S', 'Dr. Sunitha Menon',
  'Dr. Latha Nair', 'Dr. Nimmy George', 'Dr. Naseema Beegum', 'Dr. Mary Joseph',
  'Dr. Indu Lekshmi', 'Dr. Sithara Nair', 'Dr. Ancy Thomas', 'Dr. Rose Mathew',
  'Dr. Elizabeth Chandy', 'Dr. Swapna Jose', 'Dr. Jisha Varghese', 'Dr. Teena Kuruvilla',
  'Dr. Anu Sivan', 'Dr. Remya Krishnan', 'Dr. Sheela Mathew', 'Dr. Kavitha Menon',
  'Dr. Geetha Pillai', 'Dr. Neethu Rajan', 'Dr. Rima Varghese', 'Dr. Vidya Nair',
  'Dr. Soumya Warrier', 'Dr. Jessy Antony', 'Dr. Revathy Varma', 'Dr. Anupama Iyer',
  'Dr. Savitha P', 'Dr. Beena Viswanath', 'Dr. Smitha Rajan', 'Dr. Dhanya Warrier',
  'Dr. Sindhu Menon', 'Dr. Fathima Suhra', 'Dr. Reena P', 'Dr. Sabitha Beevi',
  'Dr. Jameela Banu', 'Dr. Amina Rasheed', 'Dr. Radhika Menon', 'Dr. Preethi Warrier',
  'Dr. Shereena Ali', 'Dr. Anjana Gopinath', 'Dr. Neha Thomas', 'Dr. Megha S',
  'Dr. Lekha P', 'Dr. Mini K', 'Dr. Reshma N', 'Dr. Jincy Jose',
  'Dr. Anitha Das', 'Dr. Sreeja Pillai', 'Dr. Nisha Ummer', 'Dr. Ashwathy Nair',
  'Dr. Fathima Ashraf', 'Dr. Shruthi Shetty', 'Dr. Ramya Pai', 'Dr. Vidya Kamath',
  'Dr. Geetha Prabhu', 'Dr. Poornima Rao', 'Dr. Indu Lekshmi'
];

const maleDoctors = [
  'Dr. Biju Menon', 'Dr. Suresh Kumar', 'Dr. Mohan Thomas', 'Dr. George Kurian',
  'Dr. Rajesh Panicker', 'Dr. Hari Prasad', 'Dr. Faisal Ahmed', 'Dr. John Jacob',
  'Dr. Vinod Pillai', 'Dr. Nithin Raj', 'Dr. Arjun Das', 'Dr. Sandeep Menon',
  'Dr. Joseph Kurian', 'Dr. Abdul Kareem', 'Dr. Thomas Chacko', 'Dr. Vijay Kumar',
  'Dr. Anand Krishnan', 'Dr. Balachandran K', 'Dr. Sajan Varghese', 'Dr. Praveen Gopi',
  'Dr. Rajesh Menon', 'Dr. Abraham Kurian', 'Dr. Paul Varghese', 'Dr. Jayakrishnan N',
  'Dr. Sreejith S', 'Dr. Manoj Kumar', 'Dr. Harikrishnan V', 'Dr. Binoy Mathew',
  'Dr. Shaji P', 'Dr. Sunil Abraham', 'Dr. Ravi Varma', 'Dr. Mathew Joseph',
  'Dr. Jose Kurian', 'Dr. Zubair Ahmed', 'Dr. K. R. Nambiar', 'Dr. Girish Kumar',
  'Dr. Ramakrishnan P', 'Dr. Unnikrishnan Menon', 'Dr. Musthafa K', 'Dr. Davis K.J.',
  'Dr. Muralidharan N', 'Dr. Chandrasekharan Nair', 'Dr. Krishnadas P', 'Dr. Asif Mohammed',
  'Dr. Balakrishnan E', 'Dr. Hameed Ali', 'Dr. Abdul Azeez', 'Dr. Moideen Kutty',
  'Dr. Shihabudheen K', 'Dr. Ashraf P.K.', 'Dr. Gopinathan Pillai', 'Dr. C.K. Sasidharan',
  'Dr. Bhaskaran Nambiar', 'Dr. M.K. Haris', 'Dr. T.P. Jayaraman', 'Dr. Alex John',
  'Dr. Santosh Prabhu', 'Dr. Sajan George', 'Dr. Praveen Kumar', 'Dr. Madhavan Kutty',
  'Dr. Prakash Nambiar', 'Dr. Rajeev Menon', 'Dr. Surendran P', 'Dr. Dinesh Kumar',
  'Dr. P.K. Gopinath', 'Dr. Vinod Rai', 'Dr. Mahesh Hegde', 'Dr. Uday Shankar',
  'Dr. Abdul Latheef', 'Dr. Moidu Haji'
];

const verifyGenderAssignments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const doctors = await Doctor.find().populate('userId', 'name');
    
    let correctFemale = 0;
    let correctMale = 0;
    let incorrectAssignments = [];

    console.log('=== VERIFYING GENDER ASSIGNMENTS ===\n');

    for (const doctor of doctors) {
      const name = doctor.userId?.name;
      const photoUrl = doctor.photoUrl || '';
      
      const isFemaleDoctor = femaleDoctors.includes(name);
      const isMaleDoctor = maleDoctors.includes(name);
      const hasFemaleImage = photoUrl.includes('/female/');
      const hasMaleImage = photoUrl.includes('/male/');

      if (isFemaleDoctor && hasFemaleImage) {
        correctFemale++;
      } else if (isMaleDoctor && hasMaleImage) {
        correctMale++;
      } else {
        incorrectAssignments.push({
          name,
          expectedGender: isFemaleDoctor ? 'female' : 'male',
          actualImage: hasFemaleImage ? 'female' : 'male',
          photoUrl
        });
      }
    }

    console.log('=== RESULTS ===');
    console.log(`✅ Correct Female Assignments: ${correctFemale}/71`);
    console.log(`✅ Correct Male Assignments: ${correctMale}/69`);
    console.log(`Total Correct: ${correctFemale + correctMale}/140\n`);

    if (incorrectAssignments.length > 0) {
      console.log('❌ INCORRECT ASSIGNMENTS:');
      incorrectAssignments.forEach(item => {
        console.log(`  ${item.name}`);
        console.log(`    Expected: ${item.expectedGender} image`);
        console.log(`    Got: ${item.actualImage} image`);
        console.log(`    Path: ${item.photoUrl}\n`);
      });
    } else {
      console.log('🎉 ALL GENDER ASSIGNMENTS ARE CORRECT!');
    }

    await mongoose.connection.close();
    console.log('\n✅ Verification complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyGenderAssignments();
