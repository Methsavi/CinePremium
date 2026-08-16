import mongoose from 'mongoose';
import { config } from './src/config/env.js';
import { Hall } from './src/models/hall.model.js';

const sampleHalls = [
  {
    name: 'Grand IMAX Auditorium 1',
    screenType: 'IMAX 3D',
    seatTiers: [
      { tierName: 'VIP / Recliner', seatCount: 20, price: 25.0 },
      { tierName: 'Premium', seatCount: 50, price: 18.0 },
      { tierName: 'Standard', seatCount: 80, price: 14.0 },
    ],
    totalCapacity: 150,
  },
  {
    name: 'Dolby Atmos Theatre 2',
    screenType: 'Dolby Cinema',
    seatTiers: [
      { tierName: 'VIP Recliner', seatCount: 16, price: 22.0 },
      { tierName: 'Standard', seatCount: 64, price: 12.5 },
      { tierName: 'Economy', seatCount: 40, price: 9.5 },
    ],
    totalCapacity: 120,
  },
  {
    name: '4DX Motion Suite 3',
    screenType: '4DX',
    seatTiers: [
      { tierName: 'Premium Motion', seatCount: 36, price: 28.0 },
      { tierName: 'Standard Motion', seatCount: 44, price: 20.0 },
    ],
    totalCapacity: 80,
  },
];

const seedHalls = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.dbUri);
    console.log('Connected to MongoDB.');

    await Hall.deleteMany({});
    console.log('Cleared existing halls.');

    await Hall.insertMany(sampleHalls);
    console.log('Sample cinema halls seeded successfully!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding halls:', error);
    process.exit(1);
  }
};

seedHalls();
