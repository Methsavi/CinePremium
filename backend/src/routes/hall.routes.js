import { Router } from 'express';
import {
  getHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall,
} from '../controllers/hall.controller.js';

const router = Router();

router.route('/')
  .get(getHalls)
  .post(createHall);

router.route('/:id')
  .get(getHallById)
  .put(updateHall)
  .delete(deleteHall);

export default router;
