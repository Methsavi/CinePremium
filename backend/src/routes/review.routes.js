import { Router } from 'express';
import {
  getMovieReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/review.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getAllReviews);
router.get('/movie/:movieId', getMovieReviews);

// Protected routes (JWT required)
router.post('/movie/:movieId', verifyJWT, createReview);
router.put('/:id', verifyJWT, updateReview);
router.delete('/:id', verifyJWT, deleteReview);

export default router;
