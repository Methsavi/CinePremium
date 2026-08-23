import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/bookingApi';
import { Movie } from '../../types/movie';
import { CinemaHall } from '../../types/hall';
import { HERO_MOVIE } from '../../data/movies';
import { io, Socket } from 'socket.io-client';
import {
  Armchair,
  ChevronLeft,
  Calendar,
  Clock,
  Tv,
  Ticket,
  AlertCircle,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';

interface SeatData {
  id: string;
  row: string;
  number: number;
  tier: 'VIP' | 'Executive' | 'Standard' | 'Couple';
  price: number;
  status: 'available' | 'occupied' | 'selected';
}

const SEAT_TIER_CONFIG = {
  VIP: { name: 'VIP Recliner', price: 22, color: 'border-amber-400/50 text-amber-300 bg-amber-500/10' },
  Executive: { name: 'Executive Club', price: 18, color: 'border-indigo-400/50 text-indigo-300 bg-indigo-500/10' },
  Standard: { name: 'Standard Seat', price: 14, color: 'border-slate-500/50 text-slate-300 bg-slate-800/40' },
  Couple: { name: 'Couple Lounger', price: 28, color: 'border-pink-500/50 text-pink-300 bg-pink-500/10' },
};

// Generate realistic cinema hall seating plan
const generateCinemaHallSeats = (occupiedIds: string[] = []): SeatData[] => {
  const rows = [
    { row: 'A', tier: 'VIP' as const, price: 22, count: 10 },
    { row: 'B', tier: 'VIP' as const, price: 22, count: 10 },
    { row: 'C', tier: 'Executive' as const, price: 18, count: 12 },
    { row: 'D', tier: 'Executive' as const, price: 18, count: 12 },
    { row: 'E', tier: 'Standard' as const, price: 14, count: 12 },
    { row: 'F', tier: 'Standard' as const, price: 14, count: 12 },
    { row: 'G', tier: 'Couple' as const, price: 28, count: 8 },
  ];

  const seatsList: SeatData[] = [];

  rows.forEach((r) => {
    for (let i = 1; i <= r.count; i++) {
      const seatId = `${r.row}${i}`;
      const isOccupied = occupiedIds.includes(seatId);
      seatsList.push({
        id: seatId,
        row: r.row,
        number: i,
        tier: r.tier,
        price: r.price,
        status: isOccupied ? 'occupied' : 'available',
      });
    }
  });

  return seatsList;
};

export function SeatSelectionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  // Retrieve state passed from MovieShowtimes or fallback
  const passedState = location.state || {};
  const movie: Movie = passedState.movie || HERO_MOVIE;
  const hall: CinemaHall = passedState.hall || {
    id: 'hall-imax',
    name: 'Hall 1 — IMAX Laser Experience',
    screenType: 'IMAX 3D',
    totalCapacity: 86,
    seatTiers: [],
    isActive: true,
    createdAt: ''
  };
  const showDate = passedState.showDate || new Date().toISOString().split('T')[0];
  const showTime = passedState.showTime || '07:30 PM';
  const format = passedState.format || hall.screenType || 'IMAX 3D';
  const showtimeId = passedState.showtimeId || `st-${movie.id}-${hall.id}`;

  const [seats, setSeats] = useState<SeatData[]>(() => generateCinemaHallSeats([]));
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket & fetch occupied seats
  useEffect(() => {
    const newSocket = io(BASE_URL);
    setSocket(newSocket);

    const loadOccupiedSeats = async () => {
      try {
        const response = await bookingApi.getOccupiedSeats(showtimeId, showDate);
        const occupiedIds: string[] = response.data?.occupiedSeats || [];
        setSeats(generateCinemaHallSeats(occupiedIds));
      } catch (err) {
        console.warn('Could not fetch occupied seats, using clean auditorium:', err);
        // Pre-occupy a couple of random seats for demo realism
        setSeats(generateCinemaHallSeats(['C5', 'C6', 'D4', 'D5', 'E7', 'E8']));
      }
    };

    loadOccupiedSeats();

    // Listen for real-time seat locks/bookings from other users
    newSocket.on('seatUpdated', (data: { showtimeId: string; date: string; occupiedSeats: string[] }) => {
      if (data.showtimeId === showtimeId && data.date === showDate) {
        const occupiedIds = data.occupiedSeats || [];
        setSeats((prev) =>
          prev.map((s) => ({
            ...s,
            status: occupiedIds.includes(s.id)
              ? 'occupied'
              : selectedSeatIds.includes(s.id)
              ? 'selected'
              : 'available',
          }))
        );
      }
    });

    return () => {
      newSocket.close();
    };
  }, [showtimeId, showDate]);

  // Toggle seat selection
  const handleSeatClick = (seat: SeatData) => {
    if (seat.status === 'occupied') return;

    if (selectedSeatIds.includes(seat.id)) {
      // Deselect
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
      setSeats((prev) =>
        prev.map((s) => (s.id === seat.id ? { ...s, status: 'available' } : s))
      );
    } else {
      // Max 8 seats per booking
      if (selectedSeatIds.length >= 8) {
        setErrorMsg('You can select a maximum of 8 seats per reservation.');
        setTimeout(() => setErrorMsg(null), 3500);
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.id]);
      setSeats((prev) =>
        prev.map((s) => (s.id === seat.id ? { ...s, status: 'selected' } : s))
      );
    }
  };

  // Selected seats details
  const selectedSeatsList = useMemo(() => {
    return seats.filter((s) => selectedSeatIds.includes(s.id));
  }, [seats, selectedSeatIds]);

  const ticketsSubtotal = selectedSeatsList.reduce((acc, s) => acc + s.price, 0);
  const bookingFee = selectedSeatsList.length > 0 ? 1.50 : 0;
  const grandTotal = ticketsSubtotal + bookingFee;

  // Navigate to Checkout Page
  const handleProceedToCheckout = () => {
    if (!isAuthenticated || !token) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }

    if (selectedSeatsList.length === 0) {
      setErrorMsg('Please select at least 1 seat to proceed to checkout.');
      return;
    }

    navigate('/checkout', {
      state: {
        movie,
        hall,
        showtimeId,
        showDate,
        showTime,
        format,
        selectedSeats: selectedSeatsList.map((s) => ({
          id: s.id,
          row: s.row,
          number: s.number,
          tier: s.tier,
          price: s.price,
        })),
        ticketsSubtotal,
        bookingFee,
        grandTotal,
      }
    });
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased selection:bg-primary selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => navigate('/movies')}
        onSearchClick={() => navigate('/movies')}
      />

      {/* Main Container */}
      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto w-full space-y-8">
        
        {/* ── Breadcrumb & Top Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151b2d] border border-white/10 p-4 sm:p-5 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-[#0c1324] hover:bg-white/10 border border-[#2e3447] text-white rounded-xl transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{movie.title}</span>
                <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30 text-xs font-black uppercase">
                  {format}
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#908fa0] mt-0.5">
                <span className="text-white font-medium">{hall.name}</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Calendar className="w-3.5 h-3.5" />
                  {showDate}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-amber-300 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {showTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0c1324] px-4 py-2 rounded-2xl border border-[#2e3447]">
            <Armchair className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-white">
              Selected: <strong className="text-primary">{selectedSeatIds.length}</strong> / 8 Seats
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-2xl flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── Main Interactive Layout: Seating Plan & Checkout Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left/Center (8 cols): Real Movie Hall & Seating Map ── */}
          <div className="lg:col-span-8 bg-[#0c1324] border border-[#2e3447] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-10 overflow-hidden relative">
            
            {/* ── Curved Projector Cinema Screen ── */}
            <div className="relative w-full max-w-xl mx-auto flex flex-col items-center pt-2 select-none">
              {/* Glowing Curved Screen Bar */}
              <div className="w-full h-3 rounded-full bg-gradient-to-r from-primary/30 via-white/90 to-primary/30 shadow-[0_0_35px_rgba(255,255,255,0.7)] border-t border-white" />
              
              {/* Projector Light Beam Cone */}
              <div className="w-full h-24 bg-gradient-to-b from-white/15 via-primary/5 to-transparent clip-path-polygon pointer-events-none blur-sm" />
              
              <div className="text-[11px] font-black uppercase tracking-[0.25em] text-[#908fa0] mt-1 text-center">
                ALL EYES THIS WAY • CINEMA SCREEN
              </div>
            </div>

            {/* ── Real Seating Grid ── */}
            <div className="space-y-4 max-w-2xl mx-auto pt-2 overflow-x-auto pb-4 scrollbar-none">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((rowLetter) => {
                const rowSeats = seats.filter((s) => s.row === rowLetter);
                if (rowSeats.length === 0) return null;

                const tierName = rowSeats[0].tier;
                const tierConfig = SEAT_TIER_CONFIG[tierName];
                const splitIndex = Math.ceil(rowSeats.length / 2);
                const leftWing = rowSeats.slice(0, splitIndex);
                const rightWing = rowSeats.slice(splitIndex);

                return (
                  <div key={rowLetter} className="flex items-center justify-center gap-3 sm:gap-6">
                    {/* Row Label Left */}
                    <span className="w-5 text-xs font-black text-[#908fa0] text-center font-mono">
                      {rowLetter}
                    </span>

                    {/* Left Wing Seats */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {leftWing.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        const isOccupied = seat.status === 'occupied';

                        return (
                          <button
                            key={seat.id}
                            disabled={isOccupied}
                            onClick={() => handleSeatClick(seat)}
                            title={`${seat.id} — ${tierConfig.name} (Rs. ${seat.price})`}
                            className={`relative rounded-t-lg transition-all duration-200 cursor-pointer flex flex-col items-center justify-center group ${
                              tierName === 'Couple'
                                ? 'w-12 sm:w-14 h-9 sm:h-10'
                                : 'w-7 sm:w-8 h-8 sm:h-9'
                            } ${
                              isOccupied
                                ? 'bg-slate-800/30 border border-slate-700/40 text-slate-600 cursor-not-allowed opacity-40'
                                : isSelected
                                ? 'bg-primary border-2 border-white text-white shadow-[0_0_15px_rgba(229,9,20,0.8)] scale-110 z-10 font-bold'
                                : `border hover:scale-108 hover:border-white ${tierConfig.color}`
                            }`}
                          >
                            <span className="text-[9px] sm:text-[10px] font-bold">
                              {seat.number}
                            </span>
                            {/* Little seat base cushion indicator */}
                            <div className="w-full h-1 bg-black/30 rounded-b mt-auto" />
                          </button>
                        );
                      })}
                    </div>

                    {/* Center Walkway Aisle */}
                    <div className="w-4 sm:w-8 flex items-center justify-center">
                      <div className="w-0.5 h-6 bg-white/10 rounded-full" />
                    </div>

                    {/* Right Wing Seats */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {rightWing.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        const isOccupied = seat.status === 'occupied';

                        return (
                          <button
                            key={seat.id}
                            disabled={isOccupied}
                            onClick={() => handleSeatClick(seat)}
                            title={`${seat.id} — ${tierConfig.name} (Rs. ${seat.price})`}
                            className={`relative rounded-t-lg transition-all duration-200 cursor-pointer flex flex-col items-center justify-center group ${
                              tierName === 'Couple'
                                ? 'w-12 sm:w-14 h-9 sm:h-10'
                                : 'w-7 sm:w-8 h-8 sm:h-9'
                            } ${
                              isOccupied
                                ? 'bg-slate-800/30 border border-slate-700/40 text-slate-600 cursor-not-allowed opacity-40'
                                : isSelected
                                ? 'bg-primary border-2 border-white text-white shadow-[0_0_15px_rgba(229,9,20,0.8)] scale-110 z-10 font-bold'
                                : `border hover:scale-108 hover:border-white ${tierConfig.color}`
                            }`}
                          >
                            <span className="text-[9px] sm:text-[10px] font-bold">
                              {seat.number}
                            </span>
                            <div className="w-full h-1 bg-black/30 rounded-b mt-auto" />
                          </button>
                        );
                      })}
                    </div>

                    {/* Row Label Right */}
                    <span className="w-5 text-xs font-black text-[#908fa0] text-center font-mono">
                      {rowLetter}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── Legend Bar ── */}
            <div className="pt-4 border-t border-[#2e3447] flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#dce1fb]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-slate-800 border border-slate-500/50" />
                <span>Available</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary border-2 border-white shadow-sm" />
                <span className="font-bold text-white">Selected</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-slate-800/30 border border-slate-700 opacity-40" />
                <span className="text-[#908fa0]">Occupied</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-amber-500/20 border border-amber-400/60" />
                <span>VIP Recliner (Rs. 22)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-indigo-500/20 border border-indigo-400/60" />
                <span>Executive (Rs. 18)</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-pink-500/20 border border-pink-400/60" />
                <span>Couple Lounger (Rs. 28)</span>
              </div>
            </div>
          </div>

          {/* ── Right (4 cols): Order Summary & Checkout Drawer ── */}
          <div className="lg:col-span-4 bg-[#151b2d] border border-[#2e3447] rounded-3xl p-6 shadow-2xl space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-[#2e3447] pb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-white font-display">Booking Summary</h3>
              </div>
              <span className="text-xs font-bold text-[#c0c1ff] bg-[#0c1324] px-2.5 py-1 rounded-full border border-[#2e3447]">
                {format}
              </span>
            </div>

            {/* Movie Card Snippet */}
            <div className="flex items-start gap-3 p-3 bg-[#0c1324] rounded-2xl border border-[#2e3447]">
              <img
                src={movie.posterUrl || movie.backdropUrl}
                alt={movie.title}
                className="w-16 h-22 object-cover rounded-xl border border-white/10 shrink-0 shadow-md"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="font-bold text-sm text-white truncate">{movie.title}</h4>
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <Tv className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{hall.name}</span>
                </p>
                <p className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{showDate} · {showTime}</span>
                </p>
              </div>
            </div>

            {/* Selected Seats Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#908fa0] uppercase tracking-wider block">
                Selected Seats ({selectedSeatsList.length})
              </span>

              {selectedSeatsList.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#0c1324] border border-dashed border-[#2e3447] text-center text-xs text-[#908fa0]">
                  Tap on any available seat in the auditorium to reserve.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {selectedSeatsList.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#0c1324] border border-[#2e3447] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary border border-primary/40 font-bold flex items-center justify-center text-[10px]">
                          {s.id}
                        </span>
                        <span className="text-white font-medium">{s.tier} Seat</span>
                      </div>
                      <span className="font-bold text-emerald-400">Rs. {s.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="p-4 bg-[#0c1324] rounded-2xl border border-[#2e3447] space-y-2 text-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Tickets Subtotal</span>
                <span className="text-white font-bold">Rs. {ticketsSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Digital Service & Booking Fee</span>
                <span className="text-white font-bold">Rs. {bookingFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#2e3447] flex items-center justify-between text-sm">
                <span className="font-bold text-white">Grand Total Amount</span>
                <span className="font-black text-xl text-emerald-400">
                  Rs. {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              disabled={selectedSeatsList.length === 0}
              onClick={handleProceedToCheckout}
              className="liquid-glow-btn w-full text-surface-container-lowest font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Checkout (Rs. {grandTotal.toFixed(2)})</span>
            </button>

            <p className="text-[11px] text-center text-[#908fa0] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guaranteed Reserved Seating · Instant E-Ticket</span>
            </p>
          </div>
        </div>
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}

export default SeatSelectionPage;
