export type FormatType = 'IMAX 3D' | '4DX' | 'Dolby Cinema' | '2D' | 'ScreenX';

export interface Showtime {
  id: string;
  time: string;
  format: string;
  price: number;
  hall: string;
}

export interface Cinema {
  id: string;
  name: string;
  location: string;
  distance: string;
  showtimes: Showtime[];
}

export interface CastMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
}

export interface Movie {
  id: string;
  title: string;
  tagline?: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  voteCount?: string;
  duration: string;
  genres: string[];
  releaseDate?: string;
  ageRating?: string;
  director?: string;
  cast?: string[];
  castMembers?: CastMember[];
  reviews?: Review[];
  formats?: FormatType[];
  isFeatured?: boolean;
  status: 'now_showing' | 'coming_soon';
  trailerUrl?: string;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'couple';
  price: number;
  status: 'available' | 'occupied' | 'selected';
}
