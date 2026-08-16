import { Movie } from './movie';
import { CinemaHall } from './hall';

export interface TierPrice {
  _id?: string;
  id?: string;
  tierName: string;
  price: number;
}

export interface Showtime {
  id: string;
  movie: Movie;
  hall: CinemaHall;
  showDate: string;
  showTime: string;
  format: string;
  tierPrices: TierPrice[];
  createdAt?: string;
}

export interface CreateShowtimePayload {
  movieId: string;
  hallId: string;
  showDate: string;
  showTime: string;
  format?: string;
  tierPrices: {
    tierName: string;
    price: number;
  }[];
}
