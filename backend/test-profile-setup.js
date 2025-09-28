/**
 * Profile System Setup Test Script
 * Run this script to verify that all profile system dependencies are properly installed
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Profile System Setup...\n');

// Test 1: Check required dependencies
console.log('1. Checking dependencies...');
const requiredDeps = ['multer', 'sharp', 'validator'];
const packageJson = require('./package.json');

let depsOk = true;
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`   ❌ ${dep}: Missing`);
    depsOk = false;
  }
});

if (!depsOk) {
  console.log('\n❌ Some dependencies are missing. Run: npm install multer sharp validator');
  process.exit(1);
}

// Test 2: Check upload directory
console.log('\n2. Checking upload directory...');
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('   📁 Created uploads directory');
  }
  
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir);
    console.log('   📁 Created profiles directory');
  }
  
  // Test write permissions
  const testFile = path.join(profilesDir, 'test.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  
  console.log('   ✅ Upload directories exist and are writable');
} catch (error) {
  console.log(`   ❌ Upload directory error: ${error.message}`);
  process.exit(1);
}

// Test 3: Check if profile routes exist
console.log('\n3. Checking profile system files...');
const requiredFiles = [
  'controllers/profile.js',
  'routes/profile.js'
];

let filesOk = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file}: Missing`);
    filesOk = false;
  }
});

if (!filesOk) {
  console.log('\n❌ Some profile system files are missing.');
  process.exit(1);
}

// Test 4: Try to require dependencies
console.log('\n4. Testing dependency imports...');
try {
  require('multer');
  console.log('   ✅ multer');
  
  require('sharp');
  console.log('   ✅ sharp');
  
  require('validator');
  console.log('   ✅ validator');
} catch (error) {
  console.log(`   ❌ Dependency import error: ${error.message}`);
  console.log('\n❌ Dependencies not properly installed. Run: npm install');
  process.exit(1);
}

// Test 5: Check server.js modifications
console.log('\n5. Checking server.js configuration...');
const serverJs = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

const requiredServerConfig = [
  "app.use('/uploads', express.static('uploads'))",
  "app.use('/api/profile', require('./routes/profile'))"
];

let serverOk = true;
requiredServerConfig.forEach(config => {
  if (serverJs.includes(config)) {
    console.log(`   ✅ ${config}`);
  } else {
    console.log(`   ❌ Missing: ${config}`);
    serverOk = false;
  }
});

if (!serverOk) {
  console.log('\n❌ server.js is missing required profile system configuration.');
  process.exit(1);
}

console.log('\n🎉 Profile System Setup Test Complete!');
console.log('✅ All dependencies installed');
console.log('✅ Upload directories created');
console.log('✅ Profile system files present');
console.log('✅ Server configuration updated');
console.log('\n🚀 Your profile management system is ready to use!');
console.log('\nNext steps:');
console.log('1. Start your server: npm run dev');
console.log('2. Test the profile endpoints');
console.log('3. Check the frontend profile page at /profile');
