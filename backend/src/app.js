import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { ApiError } from './utils/apiError.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Request logging
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Body parser
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Express Monolith API',
    docs: '/api/v1/health',
  });
});

// API Routes (versioned)
app.use('/api/v1', apiRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
