import { Router } from 'express';
import {
  getShowtimes,
  createShowtime,
  deleteShowtime,
} from '../controllers/showtime.controller.js';

const router = Router();

router.route('/')
  .get(getShowtimes)
  .post(createShowtime);

router.route('/:id')
  .delete(deleteShowtime);

export default router;
