import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import connectDB from '../config/db-mongo.js';
import Admin from '../models/Admin.js';

dotenv.config();

const defaultAdmins = [
  {
    name: 'karim',
    phone: '01155993133',
    password: '3352481900',
  },
  {
    name: 'mostafa',
    phone: '01124434312',
    password: '01124434312',
  },
];

const saveOrUpdateAdmin = async ({ name, phone, password, email }) => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  let admin = await Admin.findOne({ phone });

  if (admin) {
    admin.name = name;
    admin.passwordHash = passwordHash;
    if (email) admin.email = email;
    await admin.save();
    console.log(`🔄 تم تحديث حساب المسؤول بنجاح: ${name} (${phone})`);
  } else {
    admin = await Admin.create({
      name,
      phone,
      passwordHash,
      email: email || '',
    });
    console.log(`✅ تم إنشاء حساب المسؤول بنجاح: ${name} (${phone})`);
  }

  return admin;
};

const run = async () => {
  try {
    await connectDB();

    // Check if custom user passed via command line: node seed-admins.js <name> <phone> <password> [email]
    const customName = process.argv[2];
    const customPhone = process.argv[3];
    const customPass = process.argv[4];
    const customEmail = process.argv[5];

    if (customName && customPhone && customPass) {
      console.log('📌 جاري إضافة الحساب الممرر عبر الأمر...');
      await saveOrUpdateAdmin({
        name: customName,
        phone: customPhone,
        password: customPass,
        email: customEmail,
      });
    } else {
      console.log('📌 جاري إضافة وتأكيد الحسابين الافتراضيين (karim و mostafa)...');
      for (const account of defaultAdmins) {
        await saveOrUpdateAdmin(account);
      }
    }

    console.log('\n🎉 اكتملت العملية بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ أثناء إضافة الحساب:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
