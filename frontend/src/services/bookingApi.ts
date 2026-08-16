import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';
const BOOKINGS_API = `${BASE_URL}/api/v1/bookings`;

export const bookingApi = {
  createBooking: (token: string, payload: any) =>
    axios.post(BOOKINGS_API, payload, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getMyBookings: (token: string) =>
    axios.get(`${BOOKINGS_API}/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getOccupiedSeats: (showtimeId: string, date: string) =>
    axios.get(`${BOOKINGS_API}/occupied-seats`, {
      params: { showtimeId, date }
    }),
  
  cancelBooking: (token: string, id: string) =>
    axios.patch(`${BOOKINGS_API}/${id}/cancel`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
};
