import React, { useState, useEffect } from 'react';
import { Movie, Cinema, Showtime, Seat } from '../types/movie';
import { CINEMAS } from '../data/movies';
import { X, Calendar, MapPin, Ticket, CheckCircle, Armchair, ChevronRight, ArrowLeft, QrCode, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../services/bookingApi';
import { io, Socket } from 'socket.io-client';

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

const DATES = [
  { day: 'Today', date: 'Aug 4', fullDate: '2026-08-04' },
  { day: 'Wed', date: 'Aug 5', fullDate: '2026-08-05' },
  { day: 'Thu', date: 'Aug 6', fullDate: '2026-08-06' },
  { day: 'Fri', date: 'Aug 7', fullDate: '2026-08-07' },
  { day: 'Sat', date: 'Aug 8', fullDate: '2026-08-08' },
];

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
  const { token } = useAuth();
  const [step, setStep] = useState<'showtime' | 'seats' | 'confirmation'>('showtime');
  const [selectedDate, setSelectedDate] = useState(DATES[0].fullDate);
  const [selectedCinema, setSelectedCinema] = useState<Cinema>(() => initialCinema || CINEMAS[0]);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(() => initialShowtime || (initialCinema ? initialCinema.showtimes[0] : CINEMAS[0].showtimes[0]));
  const [seats, setSeats] = useState<Seat[]>(generateSeats([]));
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BASE_URL);
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

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

    socket.on('seat_update', ({ seatId, status }: { seatId: string, status: string }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            {step === 'seats' && (
              <button
                onClick={() => setStep('showtime')}
                className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-red-500" />
                {movie.title}
              </h3>
              <p className="text-xs text-slate-400">
                {step === 'showtime' && 'Step 1: Select Date, Cinema & Showtime'}
                {step === 'seats' && 'Step 2: Choose Your Seats'}
                {step === 'confirmation' && 'Booking Confirmed!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-red-600 transition-all"
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-red-400" /> Select Date
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {DATES.map((d) => (
                    <button
                      key={d.fullDate}
                      onClick={() => setSelectedDate(d.fullDate)}
                      className={`flex flex-col items-center justify-center p-3 min-w-[80px] rounded-2xl border transition-all ${
                        selectedDate === d.fullDate
                          ? 'bg-gradient-to-b from-red-600 to-rose-600 border-red-400 text-white shadow-lg shadow-red-600/30'
                          : 'bg-slate-950/60 border-white/10 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs font-medium">{d.day}</span>
                      <span className="text-base font-bold">{d.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cinema & Showtime Cards */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" /> Cinemas & Showtimes in Your City
                </label>

                {CINEMAS.map((cinema) => (
                  <div
                    key={cinema.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      selectedCinema.id === cinema.id
                        ? 'bg-slate-800/80 border-red-500/50'
                        : 'bg-slate-950/50 border-white/10'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-bold text-white text-base">{cinema.name}</h4>
                        <p className="text-xs text-slate-400">{cinema.location} • {cinema.distance}</p>
                      </div>
                    </div>

                    {/* Showtimes Grid */}
                    <div className="flex flex-wrap gap-2.5">
                      {cinema.showtimes.map((st) => {
                        const isSelected = selectedCinema.id === cinema.id && selectedShowtime?.id === st.id;
                        return (
                          <button
                            key={st.id}
                            onClick={() => {
                              setSelectedCinema(cinema);
                              setSelectedShowtime(st);
                            }}
                            className={`px-4 py-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 border-red-400 text-white font-bold shadow-lg shadow-red-600/30'
                                : 'bg-slate-900 border-white/10 text-slate-200 hover:bg-white/10'
                            }`}
                          >
                            <div className="text-sm font-bold">{st.time}</div>
                            <div className="text-[10px] opacity-80">{st.format} • ${st.price}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SEAT SELECTION */}
          {step === 'seats' && (
            <div className="space-y-6">
              
              {/* Screen Indicator */}
              <div className="text-center space-y-2">
                <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full shadow-lg shadow-red-500/50" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  CINEMA SCREEN THIS WAY
                </span>
              </div>

              {/* Seat Map */}
              <div className="max-w-md mx-auto grid grid-cols-8 gap-2 py-4 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                {seats.map((seat) => {
                  let bgClass = 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700';
                  if (seat.status === 'occupied') bgClass = 'bg-slate-900 text-slate-600 border-transparent cursor-not-allowed';
                  if (seat.status === 'selected') bgClass = 'bg-red-600 text-white border-red-400 shadow-md shadow-red-600/40 scale-105';
                  if (seat.type === 'vip' && seat.status === 'available') bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30';

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
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-800 border border-white/10" />
                  <span>Standard ($16)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40" />
                  <span>VIP Lounge ($22)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-600" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-900" />
                  <span>Occupied</span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: CONFIRMATION SUCCESS */}
          {step === 'confirmation' && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">Tickets Confirmed!</h3>
                <p className="text-slate-400 text-sm">Booking ID: <span className="font-mono font-bold text-red-400">{confirmedBookingId}</span></p>
              </div>

              {/* Digital Ticket Card */}
              <div className="max-w-md mx-auto bg-slate-950 border border-white/15 rounded-2xl p-6 text-left space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-base">{movie.title}</h4>
                    <p className="text-xs text-slate-400">{selectedCinema.name}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-red-600 text-white">
                    {selectedShowtime?.format}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Date & Time</span>
                    <span className="text-slate-200 font-semibold">{selectedDate} • {selectedShowtime?.time}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Seats</span>
                    <span className="text-slate-200 font-semibold">{selectedSeats.map(s => s.id).join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-dashed border-white/15">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-12 h-12 text-white bg-white/10 p-1 rounded" />
                    <span className="text-[10px] text-slate-400">Scan at cinema entry gate</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Paid</span>
                    <span className="text-lg font-black text-emerald-400">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-white/10 bg-slate-950/80 flex items-center justify-between">
          {step === 'showtime' && (
            <>
              <div className="text-sm text-slate-300">
                Showtime: <span className="font-bold text-white">{selectedShowtime?.time} ({selectedShowtime?.format})</span>
              </div>
              <button
                disabled={!selectedShowtime}
                onClick={() => setStep('seats')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:scale-105 transition-all"
              >
                <span>Select Seats</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'seats' && (
            <>
              <div className="text-sm text-slate-300">
                Seats ({selectedSeats.length}): <span className="font-bold text-emerald-400">${totalAmount.toFixed(2)}</span>
              </div>
              <button
                disabled={selectedSeats.length === 0 || isBooking}
                onClick={handleConfirmPayment}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:scale-105 disabled:opacity-50 transition-all"
              >
                {isBooking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Armchair className="w-4 h-4" />
                )}
                <span>{isBooking ? 'Confirming...' : `Confirm & Pay $${totalAmount.toFixed(2)}`}</span>
              </button>
            </>
          )}

          {step === 'confirmation' && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors shadow-lg"
            >
              Done & Return to Homepage
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
