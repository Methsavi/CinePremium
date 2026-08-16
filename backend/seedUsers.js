import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './src/config/env.js';
import { MongoUser } from './src/models/user.model.js';

const seedUsers = async () => {
  try {
    console.log('Connecting to DB for seeding users...');
    await mongoose.connect(config.dbUri);
    console.log('Connected to DB successfully.');

    // Clear existing users
    await MongoUser.deleteMany({});
    console.log('Cleared existing users database collection.');

    const adminPass = await bcrypt.hash('password123', 10);
    const managerPass = await bcrypt.hash('password123', 10);
    const userPass = await bcrypt.hash('password123', 10);

    const seeded = await MongoUser.create([
      {
        name: 'Site Admin',
        email: 'admin@example.com',
        password: adminPass,
        role: 'admin',
      },
      {
        name: 'Cinema Manager',
        email: 'manager@example.com',
        password: managerPass,
        role: 'cinema_manager',
      },
      {
        name: 'Regular User',
        email: 'user@example.com',
        password: userPass,
        role: 'user',
      }
    ]);

    console.log(`Users seeded successfully: ${seeded.length} accounts created.`);
    await mongoose.disconnect();
    console.log('Disconnected from DB.');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
