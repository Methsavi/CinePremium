import axios from 'axios';
import { FeedbackReview } from '../types/review';
import { ApiResponse } from '../types/auth';

const BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
const REVIEWS_API = `${BASE_URL}/api/v1/reviews`;

export const reviewApi = {
  // Get all reviews for a movie
  getMovieReviews: async (movieId: string): Promise<FeedbackReview[]> => {
    try {
      const res = await axios.get<ApiResponse<FeedbackReview[]>>(`${REVIEWS_API}/movie/${movieId}`);
      return res.data.data || [];
    } catch (err: any) {
      console.warn('Could not fetch reviews for movie:', err);
      return [];
    }
  },

  // Get all reviews across all movies (Admin / Overview)
  getAllReviews: async (movieId?: string): Promise<FeedbackReview[]> => {
    try {
      const res = await axios.get<ApiResponse<FeedbackReview[]>>(REVIEWS_API, {
        params: movieId ? { movieId } : undefined,
      });
      return res.data.data || [];
    } catch (err: any) {
      console.warn('Could not fetch all reviews:', err);
      return [];
    }
  },

  // Create review for a movie
  createReview: async (
    token: string,
    movieId: string,
    payload: { rating: number; comment: string; movieTitle?: string }
  ): Promise<FeedbackReview> => {
    const res = await axios.post<ApiResponse<FeedbackReview>>(
      `${REVIEWS_API}/movie/${movieId}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data.data;
  },

  // Update an existing review
  updateReview: async (
    token: string,
    id: string,
    payload: { rating?: number; comment?: string }
  ): Promise<FeedbackReview> => {
    const res = await axios.put<ApiResponse<FeedbackReview>>(
      `${REVIEWS_API}/${id}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data.data;
  },

  // Delete review
  deleteReview: async (token: string, id: string): Promise<{ id: string }> => {
    const res = await axios.delete<ApiResponse<{ id: string }>>(
      `${REVIEWS_API}/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data.data;
  },
};
