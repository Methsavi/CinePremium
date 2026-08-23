import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie, Cinema, Showtime, Seat } from '../types/movie';
import { X, Calendar, MapPin, Ticket, CheckCircle, Armchair, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../services/bookingApi';
import { getShowtimes } from '../services/showtimeApi';
import { getHalls } from '../services/hallApi';
import { io, Socket } from 'socket.io-client';
import { getUpcomingCalendarDays, isShowtimePast } from '../lib/utils';

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';

interface QuickBookingModalProps {
  movie: Movie | null;
  initialCinema?: Cinema | null;
  initialShowtime?: Showtime | null;
  onClose: () => void;
  onBookingSuccess: (booking: {
    id: string;
    movie: Movie;
    cinema: Cinema;
    date: string;
    showtime: Showtime;
    seats: Seat[];
    totalAmount: number;
  }) => void;
}

const generateSeats = (occupiedIds: string[] = []): Seat[] => {
  return Array.from({ length: 48 }, (_, index) => {
    const row = String.fromCharCode(65 + Math.floor(index / 8)); // Rows A-F
    const number = (index % 8) + 1;
    const isVip = row === 'C' || row === 'D';
    const isCouple = row === 'F';
    const price = isVip ? 22 : isCouple ? 28 : 16;
    const type = isVip ? 'vip' : isCouple ? 'couple' : 'standard';
    const seatId = `${row}${number}`;
    const isOccupied = occupiedIds.includes(seatId);

    return {
      id: seatId,
      row,
      number,
      type,
      price,
      status: isOccupied ? 'occupied' : 'available'
    };
  });
};

export const QuickBookingModal: React.FC<QuickBookingModalProps> = ({
  movie,
  initialCinema,
  initialShowtime,
  onClose,
  onBookingSuccess
}) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Clock ticker for real-time past showtime invalidation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const calendarDays = useMemo(() => getUpcomingCalendarDays(5), []);
  const [step, setStep] = useState<'showtime' | 'seats' | 'confirmation'>('showtime');
  const [selectedDate, setSelectedDate] = useState(calendarDays[0].dateStr);
  const [dbShowtimes, setDbShowtimes] = useState<any[]>([]);
  const [dbHalls, setDbHalls] = useState<any[]>([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState<boolean>(true);

  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>(generateSeats([]));
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch real database showtimes and halls
  const loadDbData = useCallback(async () => {
    if (!movie) return;
    try {
      setLoadingShowtimes(true);
      const [halls, allShowtimes] = await Promise.all([
        getHalls().catch(() => []),
        getShowtimes().catch(() => [])
      ]);
      setDbHalls(halls || []);

      const movieShowtimes = (allShowtimes || []).filter((st: any) => {
        if (st.isActive === false) return false;
        const mId = typeof st.movie === 'object' ? st.movie?.id || st.movie?._id : st.movie;
        const movieUid = movie.id || (movie as any)._id;
        return mId === movieUid || st.movie?.title?.toLowerCase() === movie.title?.toLowerCase();
      });
      setDbShowtimes(movieShowtimes);
    } catch (err) {
      console.error('Failed to load database showtimes for modal', err);
    } finally {
      setLoadingShowtimes(false);
    }
  }, [movie]);

  useEffect(() => {
    loadDbData();
  }, [loadDbData]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BASE_URL);
    setSocket(newSocket);

    newSocket.on('showtime-created', loadDbData);
    newSocket.on('showtime-updated', loadDbData);
    newSocket.on('showtime-deleted', loadDbData);
    newSocket.on('catalog-updated', loadDbData);

    return () => {
      newSocket.off('showtime-created', loadDbData);
      newSocket.off('showtime-updated', loadDbData);
      newSocket.off('showtime-deleted', loadDbData);
      newSocket.off('catalog-updated', loadDbData);
      newSocket.close();
    };
  }, [loadDbData]);

  // Computed halls with active database showtimes for selectedDate
  const availableCinemas = useMemo(() => {
    if (!movie) return [];

    const dateShowtimes = dbShowtimes.filter((st) => st.showDate === selectedDate);
    
    // Group by Hall
    const cinemaMap = new Map<string, Cinema>();

    dateShowtimes.forEach((st) => {
      const hallObj = typeof st.hall === 'object' ? st.hall : dbHalls.find(h => h.id === st.hall);
      const hallId = hallObj?.id || hallObj?._id || 'hall-default';
      const hallName = hallObj?.name ? `CinePremium Multiplex – ${hallObj.name}` : 'CinePremium Multiplex';

      if (!cinemaMap.has(hallId)) {
        cinemaMap.set(hallId, {
          id: hallId,
          name: hallName,
          location: 'CinePremium Multiplex Main Floor',
          distance: hallObj?.screenType || 'Digital 3D',
          showtimes: []
        });
      }

      const cinema = cinemaMap.get(hallId)!;
      const isPast = isShowtimePast(selectedDate, st.showTime, currentTime);

      cinema.showtimes.push({
        id: st.id || st._id,
        time: st.showTime,
        format: st.format || hallObj?.screenType || '3D',
        price: st.tierPrices?.[0]?.price || 15,
        hall: hallObj?.name || 'Screen 1',
        isPast
      } as any);
    });

    return Array.from(cinemaMap.values());
  }, [movie, dbShowtimes, dbHalls, selectedDate, currentTime]);

  // Auto-select first cinema & first available showtime
  useEffect(() => {
    if (availableCinemas.length > 0) {
      setSelectedCinema(availableCinemas[0]);
      const firstFutureShow = availableCinemas[0].showtimes.find((st: any) => !st.isPast);
      setSelectedShowtime(firstFutureShow || availableCinemas[0].showtimes[0] || null);
    } else {
      setSelectedCinema(null);
      setSelectedShowtime(null);
    }
  }, [availableCinemas]);

  // Fetch occupied seats on showtime change
  useEffect(() => {
    const fetchOccupiedSeats = async () => {
      if (!selectedShowtime || !selectedDate) return;
      try {
        const response = await bookingApi.getOccupiedSeats(selectedShowtime.id, selectedDate);
        const occupiedIds = response.data.occupiedSeats || [];
        setSeats(generateSeats(occupiedIds));
      } catch (error) {
        console.error('Failed to fetch occupied seats', error);
        setSeats(generateSeats([]));
      }
    };
    fetchOccupiedSeats();
  }, [selectedShowtime, selectedDate]);

  // Handle real-time socket events for seat locking
  useEffect(() => {
    if (!socket || !selectedShowtime || !selectedDate) return;

    socket.emit('join_showtime', { showtimeId: selectedShowtime.id, date: selectedDate });

    socket.on('seats-update', ({ occupiedSeats }: { occupiedSeats: string[] }) => {
      setSeats(prev => {
        const locallySelected = new Set(prev.filter(s => s.status === 'selected').map(s => s.id));
        return generateSeats(occupiedSeats || []).map(seat => {
          if (locallySelected.has(seat.id) && seat.status !== 'occupied') {
            return { ...seat, status: 'selected' };
          }
          return seat;
        });
      });
    });

    socket.on('seat_update', ({ seatId, status, socketId }: { seatId: string, status: string, socketId?: string }) => {
      if (socketId === socket.id) return;
      setSeats(prev => prev.map(seat => {
        if (seat.id === seatId) {
          return { ...seat, status: status === 'locked' ? 'occupied' : 'available' };
        }
        return seat;
      }));
    });

    socket.on('seat_lock_failed', ({ seatId, reason }: { seatId: string, reason?: string }) => {
      alert(reason || `Seat ${seatId} was just taken by another user.`);
      setSeats(prev => prev.map(seat => {
        if (seat.id === seatId) {
          return { ...seat, status: 'occupied' };
        }
        return seat;
      }));
    });

    return () => {
      socket.emit('leave_showtime', { showtimeId: selectedShowtime.id, date: selectedDate });
      socket.off('seats-update');
      socket.off('seat_update');
      socket.off('seat_lock_failed');
    };
  }, [socket, selectedShowtime, selectedDate]);

  if (!movie) return null;

  const selectedSeats = seats.filter(s => s.status === 'selected');
  const totalAmount = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  const toggleSeat = (seatId: string) => {
    setSeats(prev =>
      prev.map(seat => {
        if (seat.id === seatId) {
          if (seat.status === 'occupied') return seat;
          
          const newStatus = seat.status === 'selected' ? 'available' : 'selected';

          if (socket && selectedShowtime) {
            socket.emit('seat_select', {
              showtimeId: selectedShowtime.id,
              date: selectedDate,
              seatId,
              status: newStatus === 'selected' ? 'locked' : 'available'
            });
          }

          return { ...seat, status: newStatus };
        }
        return seat;
      })
    );
  };

  const handleConfirmPayment = async () => {
    setIsBooking(true);
    const bookingId = 'CX-' + Math.floor(100000 + Math.random() * 900000);
    
    const bookingData = {
      bookingId,
      movieId: movie.id,
      movieTitle: movie.title,
      cinemaId: selectedCinema.id,
      cinemaName: selectedCinema.name,
      showtimeId: selectedShowtime!.id,
      showtimeTime: selectedShowtime!.time,
      date: selectedDate,
      seats: selectedSeats,
      totalAmount
    };

    try {
      if (token) {
        await bookingApi.createBooking(token, bookingData);
      }
      
      setConfirmedBookingId(bookingId);
      setStep('confirmation');

      onBookingSuccess({
        id: bookingId,
        movie,
        cinema: selectedCinema,
        date: selectedDate,
        showtime: selectedShowtime!,
        seats: selectedSeats,
        totalAmount
      });
    } catch (error) {
      console.error('Failed to create booking', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-[#0d0d10] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            {step === 'seats' && (
              <button
                onClick={() => setStep('showtime')}
                className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-red-500" />
                {movie.title}
              </h3>
              <p className="text-xs text-zinc-400">
                {step === 'showtime' && 'Step 1: Select Date, Cinema & Showtime'}
                {step === 'seats' && 'Step 2: Choose Your Seats'}
                {step === 'confirmation' && 'Booking Confirmed!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-red-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* STEP 1: SHOWTIME SELECTION */}
          {step === 'showtime' && (
            <div className="space-y-6">
              
              {/* Date Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-red-500" /> Select Date
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {calendarDays.map((d) => (
                    <button
                      key={d.dateStr}
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`flex flex-col items-center justify-center p-3 min-w-[76px] rounded-xl border transition-all cursor-pointer select-none ${
                        selectedDate === d.dateStr
                          ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                          : 'bg-zinc-950 border-white/10 text-zinc-300 hover:bg-zinc-900'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase">{d.dayLabel}</span>
                      <span className="text-base font-black my-0.5">{d.dayNum}</span>
                      <span className="text-[10px] font-semibold text-zinc-400">{d.month}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cinema & Showtime Cards */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500" /> Live Multiplex Screenings & Showtimes
                </label>

                {loadingShowtimes ? (
                  <div className="p-8 text-center bg-zinc-950 border border-white/10 rounded-xl space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-red-500 mx-auto" />
                    <p className="text-xs text-zinc-400 font-semibold">Loading real-time showtimes from database...</p>
                  </div>
                ) : availableCinemas.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-950 border border-white/10 rounded-xl">
                    <p className="text-sm font-bold text-zinc-300">No Showtimes available for this date</p>
                  </div>
                ) : (
                  availableCinemas.map((cinema) => (
                    <div
                      key={cinema.id}
                      className={`p-4 rounded-xl border transition-all ${
                        selectedCinema?.id === cinema.id
                          ? 'bg-zinc-950 border-red-500/50'
                          : 'bg-zinc-950/50 border-white/10'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div>
                          <h4 className="font-bold text-white text-base">{cinema.name}</h4>
                          <p className="text-xs text-zinc-400">{cinema.distance}</p>
                        </div>
                      </div>

                      {/* Showtimes Grid */}
                      <div className="flex flex-wrap gap-2.5">
                        {cinema.showtimes.map((st: any) => {
                          const isSelected = selectedCinema?.id === cinema.id && selectedShowtime?.id === st.id;
                          const isPast = st.isPast || false;

                          if (isPast) {
                            return (
                              <div
                                key={st.id}
                                className="px-4 py-2.5 rounded-xl border border-white/5 bg-zinc-950/60 text-left opacity-40 cursor-not-allowed select-none"
                                title="Screening time has already passed according to real time"
                              >
                                <div className="text-sm font-extrabold text-zinc-500 line-through decoration-zinc-600">
                                  {st.time}
                                </div>
                                <div className="text-[9px] font-bold text-red-400/80 uppercase">
                                  PASSED
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={st.id}
                              onClick={() => {
                                setSelectedCinema(cinema);
                                setSelectedShowtime(st);
                              }}
                              className={`px-4 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-red-600 border-red-500 text-white font-bold shadow-lg shadow-red-600/30'
                                  : 'bg-zinc-900 border-white/10 text-zinc-200 hover:bg-zinc-800'
                              }`}
                            >
                              <div className="text-sm font-bold">{st.time}</div>
                              <div className="text-[10px] opacity-80">{st.format} • Rs. {st.price}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SEAT SELECTION */}
          {step === 'seats' && (
            <div className="space-y-6">
              
              {/* Screen Indicator */}
              <div className="text-center space-y-2">
                <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full shadow-lg shadow-red-500/50" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  CINEMA SCREEN THIS WAY
                </span>
              </div>

              {/* Seat Map */}
              <div className="max-w-md mx-auto grid grid-cols-8 gap-2 py-4 bg-zinc-950 p-4 rounded-xl border border-white/10">
                {seats.map((seat) => {
                  let bgClass = 'bg-zinc-900 text-zinc-300 border-white/10 hover:bg-zinc-800';
                  if (seat.status === 'occupied') bgClass = 'bg-zinc-950 text-zinc-700 border-transparent cursor-not-allowed';
                  if (seat.status === 'selected') bgClass = 'bg-red-600 text-white border-white shadow-md shadow-red-600/40 scale-105';
                  if (seat.type === 'vip' && seat.status === 'available') bgClass = 'bg-amber-950/30 text-amber-300 border-amber-500/40 hover:bg-amber-950/50';

                  return (
                    <button
                      key={seat.id}
                      disabled={seat.status === 'occupied'}
                      onClick={() => toggleSeat(seat.id)}
                      className={`h-9 rounded-lg border text-xs font-bold flex items-center justify-center transition-all ${bgClass}`}
                    >
                      {seat.id}
                    </button>
                  );
                })}
              </div>

              {/* Seat Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-300 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-zinc-900 border border-white/10" />
                  <span>Standard (Rs. 16)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-950/30 border border-amber-500/40" />
                  <span>VIP Lounge (Rs. 22)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-600" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-zinc-950 border border-zinc-800" />
                  <span>Occupied</span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: CONFIRMATION SUCCESS */}
          {step === 'confirmation' && (
            <div className="text-center py-10 space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">
                  Payment Successful. Your Tickets are booked
                </h3>
                <p className="text-sm text-zinc-400">
                  Booking Reference ID: <strong className="text-white font-mono font-bold text-base">{confirmedBookingId}</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/my-bookings');
                  }}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>View My Tickets</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/movies');
                  }}
                  className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-sm font-semibold px-6 py-3.5 rounded-xl text-center transition-all cursor-pointer"
                >
                  Browse More Movies
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        {step !== 'confirmation' && (
          <div className="p-5 border-t border-white/10 bg-zinc-950/80 flex items-center justify-between">
            {step === 'showtime' && (
              <>
                <div className="text-sm text-zinc-300">
                  Showtime: <span className="font-bold text-white">{selectedShowtime?.time} ({selectedShowtime?.format})</span>
                </div>
                <button
                  disabled={!selectedShowtime}
                  onClick={() => setStep('seats')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <span>Select Seats</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 'seats' && (
              <>
                <div className="text-sm text-zinc-300">
                  Seats ({selectedSeats.length}): <span className="font-bold text-emerald-400">Rs. {totalAmount.toFixed(2)}</span>
                </div>
                <button
                  disabled={selectedSeats.length === 0 || isBooking}
                  onClick={handleConfirmPayment}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isBooking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Armchair className="w-4 h-4" />
                  )}
                  <span>{isBooking ? 'Confirming...' : `Confirm & Pay Rs. ${totalAmount.toFixed(2)}`}</span>
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

