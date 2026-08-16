import mongoose from 'mongoose';
import { config } from './src/config/env.js';
import { Hall } from './src/models/hall.model.js';

const hallsData = [
  {
    name: 'Hall A - IMAX Laser Grand',
    screenType: 'IMAX 3D',
    seatTiers: [
      { tierName: 'VIP Leather Recliner', seatCount: 24, price: 30.0 },
      { tierName: 'Premium Club', seatCount: 60, price: 22.5 },
      { tierName: 'Standard Lounge', seatCount: 96, price: 16.0 },
    ],
    totalCapacity: 180,
  },
  {
    name: 'Hall B - Dolby Atmos Suite',
    screenType: 'Dolby Cinema',
    seatTiers: [
      { tierName: 'VIP Couch / Recliner', seatCount: 16, price: 28.0 },
      { tierName: 'Premium Central', seatCount: 44, price: 20.0 },
      { tierName: 'Standard View', seatCount: 60, price: 14.5 },
      { tierName: 'Economy Front', seatCount: 30, price: 10.0 },
    ],
    totalCapacity: 150,
  },
  {
    name: 'Hall C - 4DX Motion Experience',
    screenType: '4DX',
    seatTiers: [
      { tierName: 'VIP Motion Pods', seatCount: 32, price: 32.0 },
      { tierName: 'Standard Motion Seats', seatCount: 48, price: 24.0 },
    ],
    totalCapacity: 80,
  },
  {
    name: 'Hall D - ScreenX Panoramic',
    screenType: 'ScreenX',
    seatTiers: [
      { tierName: 'VIP Royal Box', seatCount: 20, price: 26.0 },
      { tierName: '270° Panoramic Premium', seatCount: 50, price: 19.0 },
      { tierName: 'Standard Seating', seatCount: 70, price: 13.5 },
    ],
    totalCapacity: 140,
  },
];

const seedHallsABCD = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.dbUri);
    console.log('Connected to MongoDB.');

    await Hall.deleteMany({});
    console.log('Cleared previous halls.');

    const createdHalls = await Hall.insertMany(hallsData);
    console.log(`Successfully seeded ${createdHalls.length} halls into database:`);
    
    createdHalls.forEach((h) => {
      console.log(`- [${h.screenType}] ${h.name} (Total Seats: ${h.totalCapacity})`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding halls:', error);
    process.exit(1);
  }
};

seedHallsABCD();
