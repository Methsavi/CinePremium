import { BookingModel } from '../models/booking.model.js';
import { SeatLockModel } from '../models/seatLock.model.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Fetch all occupied seats (both confirmed bookings and active temporary locks) from MongoDB
 */
export async function getBookedAndLockedSeats({ showtimeId, date }) {
  try {
    // 1. Permanently booked seats in MongoDB
    const bookings = await BookingModel.find({
      showtimeId,
      date,
      status: 'confirmed'
    });

    const occupiedSet = new Set();
    bookings.forEach((booking) => {
      if (Array.isArray(booking.seats)) {
        booking.seats.forEach((seat) => occupiedSet.add(seat.id));
      }
    });

    // 2. Active temporary seat locks in MongoDB
    const activeLocks = await SeatLockModel.find({ showtimeId, date });
    activeLocks.forEach((lock) => occupiedSet.add(lock.seatId));

    return Array.from(occupiedSet);
  } catch (error) {
    console.error('[SeatSocket] Error fetching booked and locked seats:', error);
    return [];
  }
}

/**
 * Broadcast seat update to all clients in a specific showtime/date room
 */
export async function broadcastSeatUpdate(io, showtimeId, date) {
  if (!io || !showtimeId || !date) return;

  try {
    const roomId = `show:${showtimeId}:${date}`;
    const occupiedSeats = await getBookedAndLockedSeats({ showtimeId, date });

    io.to(roomId).emit('seats-update', {
      showtimeId,
      date,
      occupiedSeats,
      count: occupiedSeats.length,
      timestamp: new Date().toISOString()
    });

    console.log(`[SeatSocket] Broadcasted update to ${roomId}: ${occupiedSeats.length} occupied seats`);
  } catch (error) {
    console.error('[SeatSocket] Error broadcasting seat update:', error);
  }
}

export function broadcastBookingEvent(io, eventName, booking) {
  if (!io || !booking) return;

  const payload = {
    booking: booking.toJSON ? booking.toJSON() : booking,
    timestamp: new Date().toISOString()
  };

  io.to('admins').emit(eventName, payload);
  if (booking.user) {
    io.to(`user:${booking.user.toString()}`).emit(eventName, payload);
  }
}

export function broadcastCatalogEvent(io, eventName, record) {
  if (!io || !record) return;
  const payload = {
    record: record.toJSON ? record.toJSON() : record,
    timestamp: new Date().toISOString()
  };
  io.to('admins').emit(eventName, payload);
  io.emit(eventName, payload);
  io.emit('catalog-updated', { eventName, payload });
}

/**
 * Setup Socket.IO connection and event handlers
 */
export function setupSeatSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();

    try {
      socket.user = jwt.verify(token, config.jwtSecret);
      next();
    } catch (error) {
      next(new Error('Unauthorized socket connection'));
    }
  });

  io.on('connection', (socket) => {
    console.log('[SeatSocket] Client connected:', socket.id);

    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
      if (socket.user.role === 'admin' || socket.user.role === 'cinema_manager') {
        socket.join('admins');
      }
      socket.emit('socket-ready', { userId: socket.user.id, role: socket.user.role });
    }

    // Join showtime room
    socket.on('join_showtime', async (data) => {
      try {
        const { showtimeId, date } = data || {};
        if (!showtimeId || !date) {
          socket.emit('error', { message: 'Missing showtimeId or date' });
          return;
        }

        const roomId = `show:${showtimeId}:${date}`;
        socket.join(roomId);
        socket.currentRoom = roomId;
        socket.currentShowtime = { showtimeId, date };

        console.log(`[SeatSocket] Client ${socket.id} joined room: ${roomId}`);

        // Fetch current occupied & locked seats from MongoDB
        const occupiedSeats = await getBookedAndLockedSeats({ showtimeId, date });

        socket.emit('seats-update', {
          showtimeId,
          date,
          occupiedSeats,
          count: occupiedSeats.length,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('[SeatSocket] join_showtime error:', err);
      }
    });

    // Leave showtime room
    socket.on('leave_showtime', (data) => {
      const showtimeId = data?.showtimeId || socket.currentShowtime?.showtimeId;
      const date = data?.date || socket.currentShowtime?.date;

      if (showtimeId && date) {
        const roomId = `show:${showtimeId}:${date}`;
        socket.leave(roomId);
        console.log(`[SeatSocket] Client ${socket.id} left room: ${roomId}`);
      }
      socket.currentRoom = null;
      socket.currentShowtime = null;
    });

    // Request seats on demand
    socket.on('request_seats', async (data) => {
      try {
        const { showtimeId, date } = data || {};
        if (!showtimeId || !date) return;

        const occupiedSeats = await getBookedAndLockedSeats({ showtimeId, date });
        socket.emit('seats-update', {
          showtimeId,
          date,
          occupiedSeats,
          count: occupiedSeats.length,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('[SeatSocket] request_seats error:', err);
      }
    });

    // Handle real-time seat selection & MongoDB locking
    socket.on('seat_select', async ({ showtimeId, date, seatId, status }) => {
      if (!showtimeId || !date || !seatId || !['locked', 'available'].includes(status)) return;
      const roomId = `show:${showtimeId}:${date}`;

      try {
        if (status === 'locked') {
          // Verify seat is not already permanently booked in MongoDB
          const alreadyBooked = await BookingModel.findOne({
            showtimeId,
            date,
            status: 'confirmed',
            'seats.id': seatId
          });

          if (alreadyBooked) {
            socket.emit('seat_lock_failed', {
              seatId,
              reason: `Seat ${seatId} has already been booked.`
            });
            return;
          }

          // Persist temporary lock in MongoDB (unique index prevents duplicates)
          await SeatLockModel.deleteMany({
            showtimeId,
            date,
            seatId,
            createdAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) }
          });

          await SeatLockModel.create({
            showtimeId,
            date,
            seatId,
            socketId: socket.id
          });

          // Broadcast to other clients in the room
          io.to(roomId).emit('seat_update', { seatId, status: 'locked', socketId: socket.id });
        } else {
          // User deselected seat: delete temporary lock from MongoDB
          await SeatLockModel.deleteOne({
            showtimeId,
            date,
            seatId,
            socketId: socket.id
          });

          // Broadcast availability to other clients in the room
          io.to(roomId).emit('seat_update', { seatId, status: 'available', socketId: socket.id });
        }
      } catch (err) {
        if (err.code === 11000) {
          // Another user acquired lock first in MongoDB
          socket.emit('seat_lock_failed', {
            seatId,
            reason: `Seat ${seatId} was just selected by another user.`
          });
        } else {
          console.error('[SeatSocket] seat_select error:', err);
        }
      }
    });

    // Handle disconnection: remove temporary locks from MongoDB and broadcast release
    socket.on('disconnect', async () => {
      console.log('[SeatSocket] Client disconnected:', socket.id);
      try {
        const locks = await SeatLockModel.find({ socketId: socket.id });
        if (locks.length > 0) {
          await SeatLockModel.deleteMany({ socketId: socket.id });

          locks.forEach((lock) => {
            const roomId = `show:${lock.showtimeId}:${lock.date}`;
            socket.to(roomId).emit('seat_update', {
              seatId: lock.seatId,
              status: 'available'
            });
          });
        }
      } catch (err) {
        console.error('[SeatSocket] disconnect cleanup error:', err);
      }
    });
  });
}
