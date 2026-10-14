import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db-mongo.js';
import { AdminService } from '../services/admin.service.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    const phone = process.argv[2] || process.env.ADMIN_PHONE || '01000000000';
    const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'Admin@123456';
    const name = process.argv[4] || 'المسؤول';
    const email = process.argv[5] || 'admin@example.com';

    console.log(`Creating/Verifying admin with phone: ${phone}...`);
    const admin = await AdminService.createInitialAdmin({ phone, password, name, email });
    console.log('✅ Admin user created successfully:', admin);
  } catch (error) {
    if (error.statusCode === 409) {
      console.log('ℹ️ Admin user already exists.');
    } else {
      console.error('❌ Failed to create admin:', error.message);
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
