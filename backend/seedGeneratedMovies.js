import mongoose from 'mongoose';
import fs from 'fs';
import { config } from './src/config/env.js';
import { Movie } from './src/models/movie.model.js';
import { uploadFileToR2 } from './src/services/r2Storage.service.js';

const generatedMoviesData = [
  {
    filePath: 'C:\\Users\\Rajan\\.gemini\\antigravity-cli\\brain\\abc36442-7c3d-43d3-8358-4960a4ba161d\\neon_syndicate_poster_1786285300399.jpg',
    title: 'Neon Syndicate',
    tagline: 'The city belongs to them.',
    synopsis: 'In a rain-slicked cyberpunk metropolis where megacorporations control human consciousness, a rogue operative and a team of cyber-enhanced outcasts fight to liberate the city.',
    rating: 9.3,
    duration: '2h 20m',
    genres: ['Sci-Fi', 'Cyberpunk', 'Action'],
    status: 'now_showing',
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    filePath: 'C:\\Users\\Rajan\\.gemini\\antigravity-cli\\brain\\abc36442-7c3d-43d3-8358-4960a4ba161d\\cosmic_voyage_poster_1786285350354.jpg',
    title: 'Cosmic Voyage',
    tagline: 'Explore. Discover. Survive.',
    synopsis: 'An astronaut sent to survey an untouched alien planet uncovers glowing ecosystems, ancient celestial monoliths, and a mystery that challenges human understanding.',
    rating: 8.9,
    duration: '2h 05m',
    genres: ['Sci-Fi', 'Adventure', 'Mystery'],
    status: 'now_showing',
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    filePath: 'C:\\Users\\Rajan\\.gemini\\antigravity-cli\\brain\\abc36442-7c3d-43d3-8358-4960a4ba161d\\dragon_lore_poster_1786285421715.jpg',
    title: 'Dragon Realm',
    tagline: 'Experience the legend.',
    synopsis: 'When an ancient dragon awakens to reclaim its burning domain, a lone warrior holding a forgotten dragon-forged blade embarks on an epic quest across shattered lands.',
    rating: 9.5,
    duration: '2h 45m',
    genres: ['Fantasy', 'Action', 'Adventure'],
    status: 'coming_soon',
    releaseDate: 'Releasing Dec 20',
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  }
];

const seedGeneratedMovies = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.dbUri);
    console.log('Connected to MongoDB.');

    for (const movieData of generatedMoviesData) {
      console.log(`Uploading poster for movie "${movieData.title}" to Cloudflare R2...`);
      const fileBuffer = fs.readFileSync(movieData.filePath);
      
      const r2Url = await uploadFileToR2(
        fileBuffer,
        'image/jpeg',
        `${movieData.title.toLowerCase().replace(/\s+/g, '_')}.jpg`,
        'movies'
      );

      console.log(`Uploaded to R2: ${r2Url}`);

      const newMovie = new Movie({
        title: movieData.title,
        tagline: movieData.tagline,
        synopsis: movieData.synopsis,
        posterUrl: r2Url,
        backdropUrl: r2Url,
        rating: movieData.rating,
        duration: movieData.duration,
        genres: movieData.genres,
        status: movieData.status,
        releaseDate: movieData.releaseDate,
        trailerUrl: movieData.trailerUrl,
      });

      const savedMovie = await newMovie.save();
      console.log(`Saved movie "${savedMovie.title}" to MongoDB with ID: ${savedMovie._id}`);
    }

    console.log('All generated movies successfully uploaded to Cloudflare R2 and seeded into MongoDB!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding generated movies:', error);
    process.exit(1);
  }
};

seedGeneratedMovies();
