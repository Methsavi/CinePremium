import mongoose from 'mongoose';
import { config } from './src/config/env.js';
import { Movie } from './src/models/movie.model.js';
import { Hall } from './src/models/hall.model.js';
import { Showtime } from './src/models/showtime.model.js';

const seedShowtimes = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.dbUri);
    console.log('Connected to MongoDB.');

    const movies = await Movie.find({});
    const halls = await Hall.find({});

    if (movies.length === 0 || halls.length === 0) {
      console.log('Movies or Halls missing. Skipping showtime seed.');
      await mongoose.disconnect();
      return;
    }

    await Showtime.deleteMany({});
    console.log('Cleared previous showtimes.');

    const sampleShowtimes = [
      {
        movie: movies[0]._id,
        hall: halls[0]._id,
        showDate: '2026-08-15',
        showTime: '07:30 PM',
        format: halls[0].screenType || 'IMAX 3D',
        tierPrices: halls[0].seatTiers.map((t, idx) => ({
          tierName: t.tierName,
          price: 28.0 - idx * 5,
        })),
      },
      {
        movie: movies[1] ? movies[1]._id : movies[0]._id,
        hall: halls[1] ? halls[1]._id : halls[0]._id,
        showDate: '2026-08-15',
        showTime: '09:45 PM',
        format: halls[1] ? halls[1].screenType : 'Dolby Cinema',
        tierPrices: halls[1] ? halls[1].seatTiers.map((t, idx) => ({
          tierName: t.tierName,
          price: 24.0 - idx * 4,
        })) : [],
      },
    ];

    const created = await Showtime.insertMany(sampleShowtimes);
    console.log(`Successfully seeded ${created.length} movie showtime forecastings!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding showtimes:', error);
    process.exit(1);
  }
};

seedShowtimes();
