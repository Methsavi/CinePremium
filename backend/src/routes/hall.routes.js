import { Router } from 'express';
import {
  getHalls,
  getHallById,
  createHall,
  deleteHall,
} from '../controllers/hall.controller.js';

const router = Router();

router.route('/')
  .get(getHalls)
  .post(createHall);

router.route('/:id')
  .get(getHallById)
  .delete(deleteHall);

export default router;
