import axios from 'axios';
import { CinemaHall, CreateHallPayload } from '../types/hall';
import { ApiResponse } from '../types/auth';

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';
const HALLS_API = `${BASE_URL}/api/v1/halls`;

export async function getHalls(): Promise<CinemaHall[]> {
  try {
    const response = await axios.get<ApiResponse<CinemaHall[]>>(HALLS_API);
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch cinema halls'
    );
  }
}

export async function getHallById(id: string): Promise<CinemaHall> {
  try {
    const response = await axios.get<ApiResponse<CinemaHall>>(`${HALLS_API}/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch cinema hall'
    );
  }
}

export async function createHall(payload: CreateHallPayload): Promise<CinemaHall> {
  try {
    const response = await axios.post<ApiResponse<CinemaHall>>(HALLS_API, payload);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to create cinema hall'
    );
  }
}

export async function deleteHall(id: string): Promise<void> {
  try {
    await axios.delete(`${HALLS_API}/${id}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to delete cinema hall'
    );
  }
}

export const hallApi = {
  getHalls,
  getHallById,
  createHall,
  deleteHall,
};
