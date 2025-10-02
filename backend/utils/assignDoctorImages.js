const fs = require('fs');
const path = require('path');

/**
 * Detect gender from Indian name using exact classification list
 * @param {string} name - Full name
 * @returns {string} - 'male' or 'female'
 */
const detectGender = (name) => {
  // Exact list of female doctors (71 total)
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
  
  // Exact list of male doctors (69 total)
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
  
  // Check exact match first
  if (femaleDoctors.includes(name)) {
    return 'female';
  }
  
  if (maleDoctors.includes(name)) {
    return 'male';
  }
  
  // Fallback: check if name contains any female doctor name (case-insensitive)
  const nameLower = name.toLowerCase();
  for (const femaleDoc of femaleDoctors) {
    if (nameLower.includes(femaleDoc.toLowerCase())) {
      return 'female';
    }
  }
  
  // Default to male if not found
  return 'male';
};

/**
 * Get list of available doctor images
 * @param {string} gender - 'male' or 'female'
 * @returns {Array<string>} - Array of image filenames
 */
const getAvailableImages = (gender) => {
  const frontendAssetsPath = path.join(__dirname, '../../frontend/src/assets', `${gender} doctors`);
  
  try {
    if (!fs.existsSync(frontendAssetsPath)) {
      console.warn(`Directory not found: ${frontendAssetsPath}`);
      return [];
    }
    
    const files = fs.readdirSync(frontendAssetsPath);
    // Filter for image files only
    return files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
  } catch (error) {
    console.error(`Error reading ${gender} doctors directory:`, error.message);
    return [];
  }
};

/**
 * Copy image from frontend assets to backend public folder
 * @param {string} gender - 'male' or 'female'
 * @param {string} filename - Image filename
 * @returns {string} - Public URL path
 */
const copyImageToPublic = (gender, filename) => {
  const sourcePath = path.join(__dirname, '../../frontend/src/assets', `${gender} doctors`, filename);
  const publicDir = path.join(__dirname, '../public/doctor-photos');
  const genderDir = path.join(publicDir, gender);
  
  // Create directories if they don't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(genderDir)) {
    fs.mkdirSync(genderDir, { recursive: true });
  }
  
  const destPath = path.join(genderDir, filename);
  
  try {
    // Copy file if it doesn't exist
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(sourcePath, destPath);
    }
    
    // Return public URL path
    return `/doctor-photos/${gender}/${filename}`;
  } catch (error) {
    console.error(`Error copying image ${filename}:`, error.message);
    return null;
  }
};

/**
 * Assign unique doctor image based on gender
 * Tracks used images to avoid duplicates
 */
class DoctorImageAssigner {
  constructor() {
    this.maleImages = getAvailableImages('male');
    this.femaleImages = getAvailableImages('female');
    this.usedMaleImages = new Set();
    this.usedFemaleImages = new Set();
    this.maleIndex = 0;
    this.femaleIndex = 0;
    
    console.log(`Found ${this.maleImages.length} male doctor images`);
    console.log(`Found ${this.femaleImages.length} female doctor images`);
  }
  
  /**
   * Get next available image for a doctor
   * @param {string} doctorName - Full name of doctor
   * @returns {string} - Public URL path to image
   */
  assignImage(doctorName) {
    const gender = detectGender(doctorName);
    const images = gender === 'female' ? this.femaleImages : this.maleImages;
    const usedImages = gender === 'female' ? this.usedFemaleImages : this.usedMaleImages;
    let index = gender === 'female' ? this.femaleIndex : this.maleIndex;
    
    if (images.length === 0) {
      console.warn(`No ${gender} images available`);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&size=400&background=0D8ABC&color=fff&bold=true`;
    }
    
    // Get next unused image (cycle through if all used)
    if (usedImages.size >= images.length) {
      // All images used, start reusing from beginning
      usedImages.clear();
      index = 0;
    }
    
    // Find next unused image
    while (usedImages.has(images[index])) {
      index = (index + 1) % images.length;
    }
    
    const selectedImage = images[index];
    usedImages.add(selectedImage);
    
    // Update index for next call
    if (gender === 'female') {
      this.femaleIndex = (index + 1) % images.length;
    } else {
      this.maleIndex = (index + 1) % images.length;
    }
    
    // Copy image to public folder and return URL
    const publicUrl = copyImageToPublic(gender, selectedImage);
    
    if (!publicUrl) {
      // Fallback to avatar if copy failed
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&size=400&background=0D8ABC&color=fff&bold=true`;
    }
    
    return publicUrl;
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      totalMaleImages: this.maleImages.length,
      totalFemaleImages: this.femaleImages.length,
      usedMaleImages: this.usedMaleImages.size,
      usedFemaleImages: this.usedFemaleImages.size
    };
  }
}

module.exports = {
  DoctorImageAssigner,
  detectGender,
  getAvailableImages
};
