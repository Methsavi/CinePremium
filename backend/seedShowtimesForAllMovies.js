import mongoose from 'mongoose';
import { config } from './src/config/env.js';
import { Movie } from './src/models/movie.model.js';
import { Hall } from './src/models/hall.model.js';
import { Showtime } from './src/models/showtime.model.js';

const TIME_SLOTS = ['10:00 AM', '01:30 PM', '04:30 PM', '07:30 PM', '10:15 PM'];
const DATES = ['2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15', '2026-08-16'];

const seedShowtimesForAllMovies = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.dbUri);
    console.log('Connected to MongoDB.');

    const movies = await Movie.find({});
    const halls = await Hall.find({});

    if (movies.length === 0) {
      console.log('No movies found in database.');
      await mongoose.disconnect();
      return;
    }

    if (halls.length === 0) {
      console.log('No halls found in database.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${movies.length} movies and ${halls.length} halls.`);

    // Clear existing showtimes
    await Showtime.deleteMany({});
    console.log('Cleared existing showtimes.');

    const showtimesToInsert = [];

    // Assign showtimes for each movie across available halls and dates
    movies.forEach((movie, mIndex) => {
      // Pick 2 halls for each movie based on index offset
      const primaryHall = halls[mIndex % halls.length];
      const secondaryHall = halls[(mIndex + 1) % halls.length];

      // Assign showtimes over 3 to 4 dates
      DATES.slice(0, 3 + (mIndex % 3)).forEach((date, dIndex) => {
        // Slot 1: Primary Hall
        const timeSlot1 = TIME_SLOTS[(mIndex + dIndex) % TIME_SLOTS.length];
        showtimesToInsert.push({
          movie: movie._id,
          hall: primaryHall._id,
          showDate: date,
          showTime: timeSlot1,
          format: primaryHall.screenType || 'Standard 2D',
          tierPrices: (primaryHall.seatTiers || []).map((tier) => ({
            tierName: tier.tierName,
            price: tier.price > 0 ? tier.price : 18.0,
          })),
        });

        // Slot 2: Secondary Hall (Evening or Night slot)
        const timeSlot2 = TIME_SLOTS[(mIndex + dIndex + 2) % TIME_SLOTS.length];
        showtimesToInsert.push({
          movie: movie._id,
          hall: secondaryHall._id,
          showDate: date,
          showTime: timeSlot2,
          format: secondaryHall.screenType || 'Standard 2D',
          tierPrices: (secondaryHall.seatTiers || []).map((tier) => ({
            tierName: tier.tierName,
            price: tier.price > 0 ? tier.price : 15.0,
          })),
        });
      });
    });

    const inserted = await Showtime.insertMany(showtimesToInsert);
    console.log(`Successfully created and saved ${inserted.length} showtimes for all ${movies.length} movies!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding showtimes:', error);
    process.exit(1);
  }
};

seedShowtimesForAllMovies();
