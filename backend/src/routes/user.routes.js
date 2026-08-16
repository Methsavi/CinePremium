import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/v1/users - Returns list of registered users
router.get('/', getUsers);
router.get('/:id', verifyJWT, getUserById);
router.post('/', verifyJWT, createUser);
router.put('/:id', verifyJWT, updateUser);
router.delete('/:id', deleteUser);

export default router;
