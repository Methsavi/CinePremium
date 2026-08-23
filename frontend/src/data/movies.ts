import { Movie } from '../types/movie';

// Hero section showcase movie (Preserved for Hero session)
export const HERO_MOVIE: Movie = {
  id: 'm-hero',
  title: 'Spider Man: Brand New Day',
  tagline: 'A new day. A new city. A brand-new Spider Man.',
  synopsis: 'Peter Parker begins a new chapter as Spider Man, facing a fresh threat while protecting New York and finding his place in a world that has changed around him.',
  posterUrl: 'https://cdn.marvel.com/content/1x/spidermanbrandnewday_lob_crd_02.webp',
  backdropUrl: 'https://cdn.marvel.com/content/2x/spidermanbrandnewday_lob_mas_mob_02_0.webp',
  trailerUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
  rating: 0,
  duration: 'TBA',
  genres: ['Action', 'Adventure', 'Superhero'],
  releaseDate: 'July 31, 2026',
  ageRating: 'PG-13',
  director: 'Destin Daniel Cretton',
  status: 'coming_soon',
  castMembers: [
    {
      id: 'c1',
      name: 'Elias Vance',
      role: 'Cmdr. Steele',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApJygMX6CcHd_rME1vUa2lekGbVkC47aHVT-lHHp_-kNyqvmbBiuC3buS1TOSSRMnK1T3d_Q9R0BHlkt8QJqJKnrEFAB_hi0g18JDyvwfaWMQ7hGon2zDJFYBxNo_NIV62mKGGFkS9cagS_hL1DvUZd-35fdP7W9KsdY-zw22hwYTQB0tgMqLyBDqs2gF2tyzbe4A9r17l9De6pFLB1I7qnawRMaBKiVBRNNzYFGnycFrB_AC2slsT'
    },
    {
      id: 'c2',
      name: 'Lyra Chen',
      role: 'Dr. Aris',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-IAtFc5PZAN6ebkPs_73E-mpjwO_ZRj5BGeLO_y6Fy4yEhu_tV3UspSpoofCGxgYX5JY8Fl0APpo51BIdOjY_NBq_ajZBfoCaNE_jJr2gqvF43wGzSYVB0Ppmmd3_DUV-l-8oIHeC9RK_ke7KQZ-qEDy0C7EJc39QAcyGCCsBlorEM8KDFYfP72ml7rOpwtIrC3DdR2jeJ6OhWiObtVk8s9NLgerr9yCmQqwf-vqkWFORJfjWKthP'
    },
    {
      id: 'c3',
      name: 'Jaxon Rey',
      role: 'Pilot Kael',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL6q9KopBX7s2HvU7hjDs7zZhwwH8XfLnpPKZWUnH0e3UEg4CtqrZ6RraGC6iLwFn2hC4zHOFsMUuBbVvThFTSagf-ikuSU-MqHbJ-VWlx8PYDnqfchgPVs4v3TxlZ9rVRx4OYGtu3gewM70Uo5eyeWHy4wbIQpPZNH1ZHQ5kdRVQp8_H8zUmWHH84d7yhQUELPzM943bxJ9_LBU6itW8gn4KJpFrinuCaxB4oq8F5WtFcUZ50nn5T'
    }
  ],
  reviews: [
    {
      id: 'r1',
      author: 'Marcus Brody',
      rating: 5,
      comment: 'A visual masterpiece. The final act left me breathless. Truly the best sci-fi of the decade.'
    },
    {
      id: 'r2',
      author: 'Elena Rostova',
      rating: 4.5,
      comment: 'Incredible world-building, though the pacing dips slightly in the middle. Still highly recommended.'
    }
  ]
};
