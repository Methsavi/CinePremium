import { Movie } from '../models/movie.model.js';
import { Hall } from '../models/hall.model.js';
import { Showtime } from '../models/showtime.model.js';

const INITIAL_MOVIES = [
  {
    title: 'The Aether Horizon',
    tagline: 'A breathtaking journey beyond the known universe.',
    synopsis: 'In the year 2145, humanity\'s survival depends on a desperate mission to the edge of the known universe. A team of elite explorers aboard the starship "Vanguard" must navigate the treacherous Aether Horizon—a spatial anomaly where time and reality fracture.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoKycjUG7Xuph0joNyJ9nknimZpy5EE-ZQdSq2u0iMWf0csv6SVkvF0F8SBV2omfGuhnYg_5P1Lo-X84QNtGHpCZGEIuJ4yxw1-U_FB-eJg-uiYDcQMNKsZ0t64tHmaScHzgTy01_v5T0kpVbXXZukQ8JSn605jWz-p6dDQHxI4BXgAJ2_cDLM5LDdpodXjifj2_NXhCOWFHVFGi2qxgG0Kiw21f3gMjER3Lm5ft3cqb-x0eRRoR_k',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoKycjUG7Xuph0joNyJ9nknimZpy5EE-ZQdSq2u0iMWf0csv6SVkvF0F8SBV2omfGuhnYg_5P1Lo-X84QNtGHpCZGEIuJ4yxw1-U_FB-eJg-uiYDcQMNKsZ0t64tHmaScHzgTy01_v5T0kpVbXXZukQ8JSn605jWz-p6dDQHxI4BXgAJ2_cDLM5LDdpodXjifj2_NXhCOWFHVFGi2qxgG0Kiw21f3gMjER3Lm5ft3cqb-x0eRRoR_k',
    rating: 9.2,
    duration: '2h 15m',
    genres: ['Sci-Fi', 'Adventure'],
    status: 'now_showing',
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    title: 'Neon Rain',
    tagline: 'Shadows in the neon light.',
    synopsis: 'A lone detective investigates a rogue AI network in a neon-lit cyberpunk metropolis, uncovering a conspiracy that reaches the highest towers of power.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvytP5P3QMEvD_l48Ho0EaUIpo-Z5hT-7MgdfiiT5MRRbrakUf_ZqaeBq3VAJTrbzOnHf4onSQJKr517sNSx6DWsyPd53jVYWIn2zliiTFNDABF4VYIUkpFY8eCB4aMz_vKrdt-XMkU0etgbhpmwnqZ2S2uXjjWidhzLc6FXqrK1YALzlKTmFPiXMFelceENBB6qItoAPrtCDgdTC1FKzyaAPxSI5CmqZPe6-J5fcKLijCvEY48dXE',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvytP5P3QMEvD_l48Ho0EaUIpo-Z5hT-7MgdfiiT5MRRbrakUf_ZqaeBq3VAJTrbzOnHf4onSQJKr517sNSx6DWsyPd53jVYWIn2zliiTFNDABF4VYIUkpFY8eCB4aMz_vKrdt-XMkU0etgbhpmwnqZ2S2uXjjWidhzLc6FXqrK1YALzlKTmFPiXMFelceENBB6qItoAPrtCDgdTC1FKzyaAPxSI5CmqZPe6-J5fcKLijCvEY48dXE',
    rating: 8.4,
    duration: '1h 55m',
    genres: ['Sci-Fi', 'Thriller'],
    status: 'now_showing',
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    title: 'Velocity Drive',
    tagline: 'No limits. No regrets.',
    synopsis: 'High-speed action and desert drift battles at the absolute edge of endurance as rival racing syndicates compete for the ultimate trophy.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb9BJ1_qgykKI0DK7DFqjRfne_7-F7mWxfwMKY6RNXlpU8fJ4YJ-XD_8LJP_ncqB8oSqKzqoyCV-wagdOgKU43ADurcmypmol-yYtZt6QqwYSlbSgWFrvslYBmqUSfHuKBtAgwWndBNJHBKeWfnSlDG3gWmvSeyAbOM0v_-KuCEgftskemAfjoeJ0JoO94TzKsNrKOOydmI5ymE-8ppbqJLDBby4-03o-PTcrnln0lnU7qSjkKGd08',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb9BJ1_qgykKI0DK7DFqjRfne_7-F7mWxfwMKY6RNXlpU8fJ4YJ-XD_8LJP_ncqB8oSqKzqoyCV-wagdOgKU43ADurcmypmol-yYtZt6QqwYSlbSgWFrvslYBmqUSfHuKBtAgwWndBNJHBKeWfnSlDG3gWmvSeyAbOM0v_-KuCEgftskemAfjoeJ0JoO94TzKsNrKOOydmI5ymE-8ppbqJLDBby4-03o-PTcrnln0lnU7qSjkKGd08',
    rating: 9.1,
    duration: '2h 05m',
    genres: ['Action', 'Adrenaline'],
    status: 'now_showing',
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    title: 'Skyward Bound',
    tagline: 'Reach for the stars.',
    synopsis: 'A magical animated journey aboard a flying ship across pink sea clouds to find the legendary lost islands of the sky.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuzeTfD3c5g7f4svVTiLeUhRSBBoXWak5h8977qd6cFFwAtStu0KBgotWn4YSaBeeOSmcjWw9n53RafWBUHd6LBucoViT1BTZM-ag5xctxMo1TMpy2U2A1SO3JY-C8IrbAjErRONy5IvZ7MKDXUGEbQkd6OTbvXFdKCBIO3zwGxve8YQ5vH_fP7P2GEnaTgMBLPBSALI2mUiUZImcC4qf9ul40GAM9z4FVG04jghatc9-PRDP-XMQ4',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuzeTfD3c5g7f4svVTiLeUhRSBBoXWak5h8977qd6cFFwAtStu0KBgotWn4YSaBeeOSmcjWw9n53RafWBUHd6LBucoViT1BTZM-ag5xctxMo1TMpy2U2A1SO3JY-C8IrbAjErRONy5IvZ7MKDXUGEbQkd6OTbvXFdKCBIO3zwGxve8YQ5vH_fP7P2GEnaTgMBLPBSALI2mUiUZImcC4qf9ul40GAM9z4FVG04jghatc9-PRDP-XMQ4',
    rating: 8.9,
    duration: '1h 30m',
    genres: ['Animation', 'Family'],
    status: 'now_showing',
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    title: "Dragon's Fall",
    tagline: 'The reign of beasts ends here.',
    synopsis: 'The highly anticipated sequel to the fantasy epic that redefined the genre. Heroes unite to defend the realm from ancient dragons.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHr9oP6_3-v5XvN7i2wzBfQ1p5q_qCj6yJ6kLwY2wP-cR_F_u9i2m9aN3cT9uJ5wV1xQ_m6w8lP7eX8z-w2sQ9yZ2vN3_xP4-dJ5eB9pZ2rG_n9xQ4aC_tY4-qL9oB6_h1_j8f-r2gK7_y9_yJ7iP4wX3kR9_m4-kR1_o-kY7iP5uT9eD8z9_qM8pQ5yV9eM7wY4_qC6eB8_xN1aH4wP7uC5eH',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHr9oP6_3-v5XvN7i2wzBfQ1p5q_qCj6yJ6kLwY2wP-cR_F_u9i2m9aN3cT9uJ5wV1xQ_m6w8lP7eX8z-w2sQ9yZ2vN3_xP4-dJ5eB9pZ2rG_n9xQ4aC_tY4-qL9oB6_h1_j8f-r2gK7_y9_yJ7iP4wX3kR9_m4-kR1_o-kY7iP5uT9eD8z9_qM8pQ5yV9eM7wY4_qC6eB8_xN1aH4wP7uC5eH',
    rating: 9.5,
    duration: '2h 45m',
    genres: ['Fantasy', 'Action'],
    status: 'coming_soon',
    releaseDate: '2026-09-15',
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  }
];

const INITIAL_HALLS = [
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

export async function autoSeedDatabase() {
  try {
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('🌱 Seeding initial movie catalog...');
      await Movie.insertMany(INITIAL_MOVIES);
      console.log(`✅ Seeded ${INITIAL_MOVIES.length} movies.`);
    }

    const hallCount = await Hall.countDocuments();
    if (hallCount === 0) {
      console.log('🌱 Seeding initial cinema halls...');
      await Hall.insertMany(INITIAL_HALLS);
      console.log(`✅ Seeded ${INITIAL_HALLS.length} cinema halls.`);
    }

    const showtimeCount = await Showtime.countDocuments();
    if (showtimeCount === 0) {
      const allMovies = await Movie.find({});
      const allHalls = await Hall.find({});

      if (allMovies.length > 0 && allHalls.length > 0) {
        console.log('🌱 Seeding upcoming showtimes for the week...');
        const timeSlots = ['10:30 AM', '01:45 PM', '05:00 PM', '08:15 PM', '10:45 PM'];
        
        // Generate upcoming 7 dates (YYYY-MM-DD)
        const upcomingDates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return d.toISOString().split('T')[0];
        });

        const showtimesToInsert = [];
        allMovies.filter(m => m.status === 'now_showing').forEach((movie, mIdx) => {
          const hall = allHalls[mIdx % allHalls.length];
          upcomingDates.slice(0, 5).forEach((date, dIdx) => {
            const timeSlot = timeSlots[(mIdx + dIdx) % timeSlots.length];
            showtimesToInsert.push({
              movie: movie._id,
              hall: hall._id,
              showDate: date,
              showTime: timeSlot,
              format: hall.screenType || 'Standard 2D',
              tierPrices: (hall.seatTiers || []).map((t) => ({
                tierName: t.tierName,
                price: t.price > 0 ? t.price : 18.0,
              })),
            });
          });
        });

        if (showtimesToInsert.length > 0) {
          await Showtime.insertMany(showtimesToInsert);
          console.log(`✅ Seeded ${showtimesToInsert.length} showtimes.`);
        }
      }
    }
  } catch (error) {
    console.error('⚠️ [autoSeedDatabase] Error seeding database:', error.message);
  }
}
