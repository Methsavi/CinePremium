export interface SeatTier {
  _id?: string;
  id?: string;
  tierName: string;
  seatCount: number;
  price: number;
}

export interface CinemaHall {
  id: string;
  name: string;
  screenType: 'IMAX 3D' | '4DX' | 'Dolby Cinema' | 'Standard 2D' | 'ScreenX' | string;
  seatTiers: SeatTier[];
  totalCapacity: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface CreateHallPayload {
  name: string;
  screenType: string;
  seatTiers: {
    tierName: string;
    seatCount: number;
    price: number;
  }[];
}
