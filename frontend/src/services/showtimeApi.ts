import axios from 'axios';
import { Showtime, CreateShowtimePayload } from '../types/showtime';
import { ApiResponse } from '../types/auth';

const BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
const SHOWTIMES_API = `${BASE_URL}/api/v1/showtimes`;

export async function getShowtimes(): Promise<Showtime[]> {
  try {
    const response = await axios.get<ApiResponse<Showtime[]>>(SHOWTIMES_API);
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch showtimes'
    );
  }
}

export async function getShowtimeById(id: string): Promise<Showtime> {
  try {
    const response = await axios.get<ApiResponse<Showtime>>(`${SHOWTIMES_API}/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch showtime'
    );
  }
}

export async function createShowtime(payload: CreateShowtimePayload): Promise<Showtime> {
  try {
    const response = await axios.post<ApiResponse<Showtime>>(SHOWTIMES_API, payload);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to create showtime forecasting'
    );
  }
}

export async function updateShowtime(id: string, payload: Partial<CreateShowtimePayload>): Promise<Showtime> {
  try {
    const response = await axios.put<ApiResponse<Showtime>>(`${SHOWTIMES_API}/${id}`, payload);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to update showtime forecasting'
    );
  }
}

export async function deleteShowtime(id: string): Promise<void> {
  try {
    await axios.delete(`${SHOWTIMES_API}/${id}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to delete showtime'
    );
  }
}

export const showtimeApi = {
  getShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
};
