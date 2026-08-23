import axios from 'axios';
import { Movie } from '../types/movie';
import { ApiResponse } from '../types/auth';

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';
const MOVIES_API = `${BASE_URL}/api/v1/movies`;

export async function getMovies(): Promise<Movie[]> {
  try {
    const response = await axios.get<ApiResponse<Movie[]>>(MOVIES_API);
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch movies'
    );
  }
}

export async function getMovieById(id: string): Promise<Movie> {
  try {
    const response = await axios.get<ApiResponse<Movie>>(`${MOVIES_API}/${id}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch movie'
    );
  }
}

export async function addMovie(formData: FormData): Promise<Movie> {
  try {
    const response = await axios.post<ApiResponse<Movie>>(MOVIES_API, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to add movie'
    );
  }
}

export async function updateMovie(id: string, formData: FormData): Promise<Movie> {
  try {
    const response = await axios.put<ApiResponse<Movie>>(`${MOVIES_API}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to update movie'
    );
  }
}

export async function deleteMovie(id: string): Promise<void> {
  try {
    await axios.delete(`${MOVIES_API}/${id}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Failed to delete movie'
    );
  }
}

export const movieApi = {
  getMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie,
};
