import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import {
  listMovies,
  viewMovie,
  addMovie,
  updateMovie,
  removeMovie,
} from '../controllers/movies.controller.js';

const router = Router();

router.route('/')
  .get(listMovies)
  .post(
    upload.fields([
      { name: 'poster', maxCount: 1 },
      { name: 'backdrop', maxCount: 1 }
    ]),
    addMovie
  );

router.route('/:id')
  .get(viewMovie)
  .put(
    upload.fields([
      { name: 'poster', maxCount: 1 },
      { name: 'backdrop', maxCount: 1 }
    ]),
    updateMovie
  )
  .delete(removeMovie);

export default router;
