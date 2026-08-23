import { Router } from 'express';
import {
  getShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
} from '../controllers/showtime.controller.js';

const router = Router();

router.route('/')
  .get(getShowtimes)
  .post(createShowtime);

router.route('/:id')
  .get(getShowtimeById)
  .put(updateShowtime)
  .delete(deleteShowtime);

export default router;
