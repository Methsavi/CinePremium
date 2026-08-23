import { Movie, Cinema } from '../types/movie';

export const HERO_MOVIE: Movie = {
  id: 'm-hero',
  title: 'Spider-Man: Brand New Day',
  tagline: 'A new day. A new city. A brand-new Spider-Man.',
  synopsis: 'Peter Parker begins a new chapter as Spider-Man, facing a fresh threat while protecting New York and finding his place in a world that has changed around him.',
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

export const NOW_PLAYING_MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'Neon Rain',
    synopsis: 'A lone detective investigates a rogue AI network in a neon-lit cyberpunk metropolis.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvytP5P3QMEvD_l48Ho0EaUIpo-Z5hT-7MgdfiiT5MRRbrakUf_ZqaeBq3VAJTrbzOnHf4onSQJKr517sNSx6DWsyPd53jVYWIn2zliiTFNDABF4VYIUkpFY8eCB4aMz_vKrdt-XMkU0etgbhpmwnqZ2S2uXjjWidhzLc6FXqrK1YALzlKTmFPiXMFelceENBB6qItoAPrtCDgdTC1FKzyaAPxSI5CmqZPe6-J5fcKLijCvEY48dXE',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvytP5P3QMEvD_l48Ho0EaUIpo-Z5hT-7MgdfiiT5MRRbrakUf_ZqaeBq3VAJTrbzOnHf4onSQJKr517sNSx6DWsyPd53jVYWIn2zliiTFNDABF4VYIUkpFY8eCB4aMz_vKrdt-XMkU0etgbhpmwnqZ2S2uXjjWidhzLc6FXqrK1YALzlKTmFPiXMFelceENBB6qItoAPrtCDgdTC1FKzyaAPxSI5CmqZPe6-J5fcKLijCvEY48dXE',
    trailerUrl: 'https://www.youtube.com/watch?v=g4Hbz2jLxvQ',
    rating: 8.4,
    duration: '1h 55m',
    genres: ['Sci-Fi', 'Thriller'],
    status: 'now_showing',
    castMembers: HERO_MOVIE.castMembers,
    reviews: HERO_MOVIE.reviews
  },
  {
    id: 'm2',
    title: 'The Silent Echo',
    synopsis: 'An elegant drama uncovering family secrets hidden behind marble corridors and silent vows.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNv2ywNqTzedchsZyCaHTjWU5tS7h71zHg0v8lIl_kvUiGnETibG_zSR2Ari5ScomARxmkARfgOWvmMgt4kvZdfndQba2A977FYyDKm6z3wekndJEL3h8lrsgBRJnps_xUkhqwtDxQyvfCOX5mTV0l6C-N47_5h6TGJPJiOvS8blXQlpHrUYDkg7i2ou4pr0kti7IDaijgm8B6PSODxZl6y9vEwIp5AmnqN1uSsk02xJcpS1glEqIr',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNv2ywNqTzedchsZyCaHTjWU5tS7h71zHg0v8lIl_kvUiGnETibG_zSR2Ari5ScomARxmkARfgOWvmMgt4kvZdfndQba2A977FYyDKm6z3wekndJEL3h8lrsgBRJnps_xUkhqwtDxQyvfCOX5mTV0l6C-N47_5h6TGJPJiOvS8blXQlpHrUYDkg7i2ou4pr0kti7IDaijgm8B6PSODxZl6y9vEwIp5AmnqN1uSsk02xJcpS1glEqIr',
    trailerUrl: 'https://www.youtube.com/watch?v=8hP9D6kZseM',
    rating: 7.9,
    duration: '2h 10m',
    genres: ['Drama', 'Mystery'],
    status: 'now_showing',
    castMembers: HERO_MOVIE.castMembers,
    reviews: HERO_MOVIE.reviews
  },
  {
    id: 'm3',
    title: 'Velocity Drive',
    synopsis: 'High-speed action and desert drift battles at the absolute edge of endurance.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb9BJ1_qgykKI0DK7DFqjRfne_7-F7mWxfwMKY6RNXlpU8fJ4YJ-XD_8LJP_ncqB8oSqKzqoyCV-wagdOgKU43ADurcmypmol-yYtZt6QqwYSlbSgWFrvslYBmqUSfHuKBtAgwWndBNJHBKeWfnSlDG3gWmvSeyAbOM0v_-KuCEgftskemAfjoeJ0JoO94TzKsNrKOOydmI5ymE-8ppbqJLDBby4-03o-PTcrnln0lnU7qSjkKGd08',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb9BJ1_qgykKI0DK7DFqjRfne_7-F7mWxfwMKY6RNXlpU8fJ4YJ-XD_8LJP_ncqB8oSqKzqoyCV-wagdOgKU43ADurcmypmol-yYtZt6QqwYSlbSgWFrvslYBmqUSfHuKBtAgwWndBNJHBKeWfnSlDG3gWmvSeyAbOM0v_-KuCEgftskemAfjoeJ0JoO94TzKsNrKOOydmI5ymE-8ppbqJLDBby4-03o-PTcrnln0lnU7qSjkKGd08',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    rating: 9.1,
    duration: '2h 05m',
    genres: ['Action', 'Adrenaline'],
    status: 'now_showing',
    castMembers: HERO_MOVIE.castMembers,
    reviews: HERO_MOVIE.reviews
  },
  {
    id: 'm4',
    title: 'Whispering Woods',
    synopsis: 'A spine-chilling horror nightmare deep inside an ancient mist-shrouded forest.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtILcvj-JlmkekqLGeqCKqVlV-T6GqfBch8rTcw5ZoeJjujTT-jL-GANfnWeJwH9JGY7aHzCPkUOWNBcYd9-Fql1aIYb0h40t6TD-5MefBCUJR4FbEOfaz7JZK-RVDX0kzOtekBc_K3RJZhK_bCrWyK-keZ5hYirHmn3vJPYUBLBwOHJ7ofMHBLNw0hSOxsmQxyGaL7XWdPDjNIa0lAa9ALksV0woviaHIrBkhtPUiMUnQVZhsglfm',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtILcvj-JlmkekqLGeqCKqVlV-T6GqfBch8rTcw5ZoeJjujTT-jL-GANfnWeJwH9JGY7aHzCPkUOWNBcYd9-Fql1aIYb0h40t6TD-5MefBCUJR4FbEOfaz7JZK-RVDX0kzOtekBc_K3RJZhK_bCrWyK-keZ5hYirHmn3vJPYUBLBwOHJ7ofMHBLNw0hSOxsmQxyGaL7XWdPDjNIa0lAa9ALksV0woviaHIrBkhtPUiMUnQVZhsglfm',
    trailerUrl: 'https://www.youtube.com/watch?v=V6wWKNij_1M',
    rating: 6.8,
    duration: '1h 45m',
    genres: ['Horror', 'Thriller'],
    status: 'now_showing',
    castMembers: HERO_MOVIE.castMembers,
    reviews: HERO_MOVIE.reviews
  },
  {
    id: 'm5',
    title: 'Skyward Bound',
    synopsis: 'A magical animated journey aboard a flying ship across pink sea clouds.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuzeTfD3c5g7f4svVTiLeUhRSBBoXWak5h8977qd6cFFwAtStu0KBgotWn4YSaBeeOSmcjWw9n53RafWBUHd6LBucoViT1BTZM-ag5xctxMo1TMpy2U2A1SO3JY-C8IrbAjErRONy5IvZ7MKDXUGEbQkd6OTbvXFdKCBIO3zwGxve8YQ5vH_fP7P2GEnaTgMBLPBSALI2mUiUZImcC4qf9ul40GAM9z4FVG04jghatc9-PRDP-XMQ4',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuzeTfD3c5g7f4svVTiLeUhRSBBoXWak5h8977qd6cFFwAtStu0KBgotWn4YSaBeeOSmcjWw9n53RafWBUHd6LBucoViT1BTZM-ag5xctxMo1TMpy2U2A1SO3JY-C8IrbAjErRONy5IvZ7MKDXUGEbQkd6OTbvXFdKCBIO3zwGxve8YQ5vH_fP7P2GEnaTgMBLPBSALI2mUiUZImcC4qf9ul40GAM9z4FVG04jghatc9-PRDP-XMQ4',
    trailerUrl: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
    rating: 8.9,
    duration: '1h 30m',
    genres: ['Animation', 'Family'],
    status: 'now_showing',
    castMembers: HERO_MOVIE.castMembers,
    reviews: HERO_MOVIE.reviews
  }
];

export const COMING_SOON_FEATURE: Movie = {
  id: 'cs-feature',
  title: "Dragon's Fall",
  synopsis: 'The highly anticipated sequel to the fantasy epic that redefined the genre.',
  posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk6C0bGtj6tLaE8nVFJlDjr2XPmtOINLepv_oL1fCwFuNALimWyrgqcynl6SWTA_WXmW-PnzAkpx5bRrdvdrQXI_3pduhtmm7evD3u-8GVp92hUgh8zdTDWEjMkIMv91hVvwPMk9gp3v9bLQXxMo6W1j6XQL70CaRZweHGJUH_YL4cUgKg4xm0MWoDRKyKCn-k_D8i-Y1OBJjL1GDRP83lV20yLOjZ0OZrA51NtcNbr45XpsrLzyl_',
  backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk6C0bGtj6tLaE8nVFJlDjr2XPmtOINLepv_oL1fCwFuNALimWyrgqcynl6SWTA_WXmW-PnzAkpx5bRrdvdrQXI_3pduhtmm7evD3u-8GVp92hUgh8zdTDWEjMkIMv91hVvwPMk9gp3v9bLQXxMo6W1j6XQL70CaRZweHGJUH_YL4cUgKg4xm0MWoDRKyKCn-k_D8i-Y1OBJjL1GDRP83lV20yLOjZ0OZrA51NtcNbr45XpsrLzyl_',
  trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
  rating: 9.6,
  duration: '2h 40m',
  genres: ['Fantasy', 'Action'],
  releaseDate: 'Releasing Nov 15',
  status: 'coming_soon',
  castMembers: HERO_MOVIE.castMembers,
  reviews: HERO_MOVIE.reviews
};

export const COMING_SOON_STACK: Movie[] = [
  {
    id: 'cs-1',
    title: 'The Last Martian',
    synopsis: 'A lone astronaut walking on red martian soil seeking a way home.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKBd51WFLwv_JOsT38mHMEbgitlFUsqO-IABUvRaqXNibDCbEKQsnkq0g6bf7gEIKD1qxHa7XCNrFqfqTT94prUSUgig0kSTlhJfdCQtu0nReeCuYaU5z9EQSuwox8rQsVvrEsu-4s3pqMVidqQ6m-cd3rXAFdgNVH6Loul1OjJ7ZYtLX9vPkaRgZgDMaTC4SGFzYheFqP3klXELMZB3OBIgoyzUQyeWIjERV8mh_R7HJJW6G9C2rn',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKBd51WFLwv_JOsT38mHMEbgitlFUsqO-IABUvRaqXNibDCbEKQsnkq0g6bf7gEIKD1qxHa7XCNrFqfqTT94prUSUgig0kSTlhJfdCQtu0nReeCuYaU5z9EQSuwox8rQsVvrEsu-4s3pqMVidqQ6m-cd3rXAFdgNVH6Loul1OjJ7ZYtLX9vPkaRgZgDMaTC4SGFzYheFqP3klXELMZB3OBIgoyzUQyeWIjERV8mh_R7HJJW6G9C2rn',
    trailerUrl: 'https://www.youtube.com/watch?v=ej3ioOneTy8',
    rating: 8.8,
    duration: '2h 15m',
    genres: ['Sci-Fi', 'Drama'],
    releaseDate: 'Dec 12',
    status: 'coming_soon',
    castMembers: HERO_MOVIE.castMembers,
    reviews: HERO_MOVIE.reviews
  },
  {
    id: 'cs-2',
    title: 'Midnight Jazz',
    synopsis: 'A moody, smoky jazz club setting with a saxophone player in silhouette.',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVN8XT6JzNPer5HDqbX9uN44D3xJ5FX5S50GdOrXx5xi754pfq27vvGdQnb4rezbvzofsz1yc4pgTYNyMj4R1x6nEw5BptG5q86y8TAeFs5rf6t4zxmLqorWB2E2bousSVHir8uMFIKhAY2YT0qhSaJTtHKhm2-x-lCvbUK-NFR5P8_6fs30g8PekzC28j_dhr97trklnUOrJsr4DmB5Q1qlMwChX7ctPGgLgR8SrsQ2l5wf00vp9Q',
    backdropUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVN8XT6JzNPer5HDqbX9uN44D3xJ5FX5S50GdOrXx5xi754pfq27vvGdQnb4rezbvzofsz1yc4pgTYNyMj4R1x6nEw5BptG5q86y8TAeFs5rf6t4zxmLqorWB2E2bousSVHir8uMFIKhAY2YT0qhSaJTtHKhm2-x-lCvbUK-NFR5P8_6fs30g8PekzC28j_dhr97trklnUOrJsr4DmB5Q1qlMwChX7ctPGgLgR8SrsQ2l5wf00vp9Q',
    trailerUrl: 'https://www.youtube.com/watch?v=0pdqf4P9MB8',
    rating: 8.5,
    duration: '1h 50m',
    genres: ['Musical', 'Drama'],
    releaseDate: 'Jan 05',
    status: 'coming_soon',
    castMembers: HERO_MOVIE.castMembers,
    reviews: HERO_MOVIE.reviews
  }
];

export const CINEMAS: Cinema[] = [
  {
    id: 'c1',
    name: 'Grand Galaxy Cinema',
    location: 'Central Plaza, Downtown',
    distance: '1.2 miles away',
    showtimes: [
      { id: 'st1', time: '18:30', format: 'IMAX', price: 18.50, hall: 'Screen 1 (IMAX)' },
      { id: 'st2', time: '21:00', format: 'IMAX', price: 18.50, hall: 'Screen 1 (IMAX)' },
    ]
  },
  {
    id: 'c2',
    name: 'Starlight Multiplex',
    location: 'Metropolitan Mall',
    distance: '2.5 miles away',
    showtimes: [
      { id: 'st3', time: '19:15', format: '3D', price: 15.00, hall: 'Screen 2' },
      { id: 'st4', time: '22:30', format: '2D', price: 12.50, hall: 'Screen 3' },
    ]
  }
];

export const USER_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWruq2LCNi8Lgv54qbWnQRNfVKmcrrwTD3yy_C6BUrbTyig9gIO3duRyS8fYd5TEP34iYCgZMnB5WFPXxFvtNg53tqUNs338nIE4PblrmzAbknduAUvh4KpJHHOfe0IXDXfLJc-K57JpF9a3ZvqWSinK1nSn8XaIPpHe3pKD8fu8ofYRjqiAwB92tVub4xB49vjLqORVkB3ELzoDZB1ds08z3yFfNQxVLUIEM_0kaxfGxEkscXljpS';
