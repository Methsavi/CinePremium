import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyJWT, getMe);
router.post('/logout', verifyJWT, logout);

export default router;
