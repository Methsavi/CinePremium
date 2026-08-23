import { BookingModel } from '../models/booking.model.js';
import { SeatLockModel } from '../models/seatLock.model.js';
import { broadcastSeatUpdate, broadcastBookingEvent } from '../socket/seatSocket.js';

export const createBooking = async (req, res) => {
  try {
    const { 
      bookingId, 
      movieId, 
      movieTitle, 
      posterUrl,
      format,
      cinemaId, 
      cinemaName, 
      showtimeId, 
      showtimeTime, 
      date, 
      seats, 
      totalAmount 
    } = req.body;

    const newBooking = new BookingModel({
      bookingId,
      user: req.user.id, // Assuming auth middleware attaches user
      movieId,
      movieTitle,
      posterUrl,
      format: format || 'Standard 2D',
      cinemaId,
      cinemaName,
      showtimeId,
      showtimeTime,
      date,
      seats,
      totalAmount
    });

    await newBooking.save();

    // Release any temporary seat locks for these seats now that they are permanently booked
    const seatIds = seats.map(s => s.id);
    await SeatLockModel.deleteMany({
      showtimeId,
      date,
      seatId: { $in: seatIds }
    });

    // Real-time broadcast to all clients viewing this showtime
    const io = req.app.get('io');
    if (io) {
      broadcastSeatUpdate(io, showtimeId, date);
      broadcastBookingEvent(io, 'booking-created', newBooking);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking
    });
  } catch (error) {
    console.error('[BookingController] createBooking error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await BookingModel.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('[BookingController] getUserBookings error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findOne({ bookingId: id, user: req.user.id });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Real-time broadcast updated seats to clients viewing this showtime
    const io = req.app.get('io');
    if (io) {
      broadcastSeatUpdate(io, booking.showtimeId, booking.date);
      broadcastBookingEvent(io, 'booking-cancelled', booking);
    }

    res.status(200).json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('[BookingController] cancelBooking error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showtimeId, date } = req.query;

    if (!showtimeId || !date) {
      return res.status(400).json({ message: 'showtimeId and date are required' });
    }

    // 1. Fetch permanently booked seats
    const bookings = await BookingModel.find({ 
      showtimeId, 
      date, 
      status: 'confirmed' 
    });

    const occupiedSeatsSet = new Set();
    bookings.forEach(booking => {
      booking.seats.forEach(seat => {
        occupiedSeatsSet.add(seat.id);
      });
    });

    // 2. Fetch temporarily locked seats from database
    const activeLocks = await SeatLockModel.find({ showtimeId, date });
    activeLocks.forEach(lock => {
      occupiedSeatsSet.add(lock.seatId);
    });

    res.status(200).json({ occupiedSeats: Array.from(occupiedSeatsSet) });
  } catch (error) {
    console.error('[BookingController] getOccupiedSeats error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
