import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { UserModel } from './models/user.model.js';
import { Server } from 'socket.io';
import { setupSeatSocket } from './socket/seatSocket.js';

let server;

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to Database & Start Server
const startServer = async () => {
  await connectDB();
  await UserModel.seedDefaultUsers();

  server = app.listen(config.port, () => {
    console.log(`🚀 Server running in ${config.nodeEnv} mode on http://localhost:${config.port}`);
  });

  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Make io accessible throughout Express controllers & services
  app.set('io', io);

  // Setup modular Socket.IO seat locking with MongoDB
  setupSeatSocket(io);
};

startServer();

// Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM / SIGINT for graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('Http server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
