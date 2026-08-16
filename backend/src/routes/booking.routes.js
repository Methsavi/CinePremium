import { Router } from 'express';
import { createBooking, getUserBookings, cancelBooking, getOccupiedSeats } from '../controllers/booking.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/occupied-seats', getOccupiedSeats);

router.use(verifyJWT);

router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);
router.patch('/:id/cancel', cancelBooking);

export default router;
