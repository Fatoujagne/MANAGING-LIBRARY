/**
 * Create Admin User Script
 * 
 * This script creates a default admin user in the database.
 * Run this script once to set up your first admin account.
 * 
 * Usage: node create-admin.js
 */

const mongoose = require('mongoose');
const User = require('./models/User.model');
require('dotenv').config();

/**
 * Create default admin user
 */
async function createAdmin() {
  try {
    // Check for required environment variables
    if (!process.env.MONGO_URI) {
      console.error('❌ ERROR: MONGO_URI is not defined in .env file');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    // Default admin credentials
    const adminEmail = 'admin@library.com';
    const adminPassword = 'admin123';
    const adminName = 'Super Admin';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin._id}`);
      console.log('\n💡 If you want to reset the password, delete this user first or update it manually.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin user
    console.log('\n📝 Creating admin user...');
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // Will be hashed automatically by User model
      role: 'Admin'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ' + admin.email);
    console.log('🔑 Password: ' + adminPassword);
    console.log('👤 Name:     ' + admin.name);
    console.log('🎭 Role:     ' + admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  SECURITY WARNING:');
    console.log('   Please change the password after first login!');
    console.log('   You can login at: http://localhost:4200/login');
    console.log('\n✅ You can now login with these credentials.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('   A user with this email already exists.');
    } else if (error.name === 'MongoServerError') {
      console.error('   MongoDB connection error. Check your MONGO_URI in .env file.');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
createAdmin();
