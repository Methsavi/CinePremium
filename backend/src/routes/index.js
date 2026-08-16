import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import movieRoutes from './movie.routes.js';
import hallRoutes from './hall.routes.js';
import showtimeRoutes from './showtime.routes.js';
import bookingRoutes from './booking.routes.js';

const router = Router();

// API V1 Routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/movies', movieRoutes);
router.use('/halls', hallRoutes);
router.use('/showtimes', showtimeRoutes);
router.use('/bookings', bookingRoutes);

export default router;
