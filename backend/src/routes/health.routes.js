import { Router } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

router.get('/', (req, res) => {
  const healthData = {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(new ApiResponse(200, healthData, 'Server health is good'));
});

export default router;
