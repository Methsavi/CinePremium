import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../services/bookingApi';
import { getMovies } from '../../services/movieApi';
import { getHalls } from '../../services/hallApi';
import { Movie } from '../../types/movie';
import { CinemaHall } from '../../types/hall';
import { io, Socket } from 'socket.io-client';
import { isShowtimePast } from '../../lib/utils';
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
  RefreshCw
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
  VIP: { name: 'VIP Recliner', color: 'border-amber-500/50 text-amber-300 bg-amber-950/20' },
  Executive: { name: 'Executive Club', color: 'border-zinc-500/50 text-zinc-300 bg-zinc-900/60' },
  Standard: { name: 'Standard Seat', color: 'border-zinc-700/50 text-zinc-400 bg-zinc-950/80' },
  Couple: { name: 'Couple Lounger', color: 'border-red-600/50 text-red-300 bg-red-950/30' },
};

interface TierPricesConfig {
  VIP: number;
  Executive: number;
  Standard: number;
  Couple: number;
}

const resolveTierPrices = (
  tierPricesList?: { tierName: string; price: number }[],
  hallSeatTiers?: { tierName: string; price: number }[]
): TierPricesConfig => {
  const tiers = (tierPricesList && tierPricesList.length > 0)
    ? tierPricesList
    : (hallSeatTiers && hallSeatTiers.length > 0)
    ? hallSeatTiers
    : [];

  if (tiers.length === 0) {
    return { VIP: 22, Executive: 18, Standard: 14, Couple: 28 };
  }

  const findPrice = (keywords: string[], fallback: number) => {
    for (const t of tiers) {
      const name = (t.tierName || '').toLowerCase();
      if (keywords.some((k) => name.includes(k.toLowerCase()))) {
        if (typeof t.price === 'number' && t.price > 0) return Number(t.price);
      }
    }
    return fallback;
  };

  const validPrices = tiers.map((t) => Number(t.price)).filter((p) => !isNaN(p) && p > 0);
  const highest = validPrices.length > 0 ? Math.max(...validPrices) : 22;
  const lowest = validPrices.length > 0 ? Math.min(...validPrices) : 14;

  const vip = findPrice(['vip', 'recliner', 'leather', 'royal', 'pod', 'first'], highest);
  const standard = findPrice(['standard', 'lounge', 'view', 'front', 'regular', 'economy'], lowest);
  const executive = findPrice(['executive', 'premium', 'club', 'central', 'panoramic', 'middle'], Math.round((vip + standard) / 2));
  const couple = findPrice(['couple', 'lounger', 'suite', 'box', 'sofa'], highest > standard ? highest : Math.round(vip * 1.25));

  return {
    VIP: vip,
    Executive: executive,
    Standard: standard,
    Couple: couple,
  };
};

// Generate realistic cinema hall seating plan with dynamic database prices
const generateCinemaHallSeats = (
  occupiedIds: string[] = [],
  prices: TierPricesConfig = { VIP: 22, Executive: 18, Standard: 14, Couple: 28 }
): SeatData[] => {
  const rows = [
    { row: 'A', tier: 'VIP' as const, price: prices.VIP, count: 10 },
    { row: 'B', tier: 'VIP' as const, price: prices.VIP, count: 10 },
    { row: 'C', tier: 'Executive' as const, price: prices.Executive, count: 12 },
    { row: 'D', tier: 'Executive' as const, price: prices.Executive, count: 12 },
    { row: 'E', tier: 'Standard' as const, price: prices.Standard, count: 12 },
    { row: 'F', tier: 'Standard' as const, price: prices.Standard, count: 12 },
    { row: 'G', tier: 'Couple' as const, price: prices.Couple, count: 8 },
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

  // Retrieve state passed from MovieShowtimes or fetch database fallback
  const passedState = location.state || {};
  const [movie, setMovie] = useState<Movie | null>(passedState.movie || null);
  const [hall, setHall] = useState<CinemaHall | null>(passedState.hall || null);
  const [loadingContext, setLoadingContext] = useState<boolean>(!passedState.movie);

  const showDate = passedState.showDate || new Date().toISOString().split('T')[0];
  const showTime = passedState.showTime || '07:30 PM';
  const format = passedState.format || hall?.screenType || 'Standard 2D';
  const showtimeId = passedState.showtimeId || `st-${movie?.id || 'main'}-${hall?.id || 'hall'}`;

  // Dynamically resolve database tier prices
  const resolvedPrices = useMemo(() => {
    return resolveTierPrices(passedState.tierPrices, hall?.seatTiers);
  }, [passedState.tierPrices, hall?.seatTiers]);

  const [seats, setSeats] = useState<SeatData[]>(() => generateCinemaHallSeats([], resolvedPrices));
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Sync seat prices whenever database tier pricing resolves
  useEffect(() => {
    setSeats((prev) =>
      prev.map((s) => ({
        ...s,
        price: resolvedPrices[s.tier] || s.price,
      }))
    );
  }, [resolvedPrices]);

  // Load database records if navigated directly without state
  useEffect(() => {
    if (!movie || !hall) {
      const loadDefaults = async () => {
        try {
          setLoadingContext(true);
          const [moviesList, hallsList] = await Promise.all([
            getMovies().catch(() => [] as Movie[]),
            getHalls().catch(() => [] as CinemaHall[])
          ]);
          if (!movie && moviesList.length > 0) setMovie(moviesList[0]);
          if (!hall && hallsList.length > 0) setHall(hallsList[0]);
        } catch (err) {
          console.error('Error fetching database context for seat selection:', err);
        } finally {
          setLoadingContext(false);
        }
      };
      loadDefaults();
    }
  }, []);

  // Initialize socket & fetch occupied seats
  useEffect(() => {
    const newSocket = io(BASE_URL);
    setSocket(newSocket);

    const loadOccupiedSeats = async () => {
      try {
        const response = await bookingApi.getOccupiedSeats(showtimeId, showDate);
        const occupiedIds: string[] = response.data?.occupiedSeats || [];
        setSeats(generateCinemaHallSeats(occupiedIds, resolvedPrices));
      } catch (err) {
        setSeats(generateCinemaHallSeats([], resolvedPrices));
      }
    };

    loadOccupiedSeats();

    newSocket.emit('join_showtime', { showtimeId, date: showDate });

    const updateSeats = ({ occupiedSeats }: { occupiedSeats: string[] }) => {
      const occupiedIds = occupiedSeats || [];
      setSeats((prev) =>
        prev.map((seat) => ({
          ...seat,
          status: occupiedIds.includes(seat.id)
            ? 'occupied'
            : selectedSeatIds.includes(seat.id)
            ? 'selected'
            : 'available',
        }))
      );
    };

    const updateSeat = ({ seatId, status, socketId }: { seatId: string; status: string; socketId?: string }) => {
      if (socketId === newSocket.id) return;
      setSeats((prev) => prev.map((seat) => (
        seat.id === seatId ? { ...seat, status: status === 'locked' ? 'occupied' : 'available' } : seat
      )));
      if (status === 'locked') {
        setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
      }
    };

    const handleLockFailed = ({ seatId, reason }: { seatId: string; reason?: string }) => {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
      setSeats((prev) => prev.map((seat) => (
        seat.id === seatId ? { ...seat, status: 'occupied' } : seat
      )));
      setErrorMsg(reason || `Seat ${seatId} was just taken by another user.`);
    };

    newSocket.on('seats-update', updateSeats);
    newSocket.on('seat_update', updateSeat);
    newSocket.on('seat_lock_failed', handleLockFailed);

    return () => {
      newSocket.emit('leave_showtime', { showtimeId, date: showDate });
      newSocket.off('seats-update', updateSeats);
      newSocket.off('seat_update', updateSeat);
      newSocket.off('seat_lock_failed', handleLockFailed);
      newSocket.close();
    };
  }, [showtimeId, showDate]);

  // Toggle seat selection
  const handleSeatClick = (seat: SeatData) => {
    if (isShowtimeExpired || seat.status === 'occupied') return;

    if (selectedSeatIds.includes(seat.id)) {
      // Deselect
      socket?.emit('seat_select', { showtimeId, date: showDate, seatId: seat.id, status: 'available' });
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
      socket?.emit('seat_select', { showtimeId, date: showDate, seatId: seat.id, status: 'locked' });
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
  const bookingFee = selectedSeatsList.length > 0 ? 100.00 : 0;
  const grandTotal = ticketsSubtotal + bookingFee;

  const isShowtimeExpired = isShowtimePast(showDate, showTime);

  // Navigate to Checkout Page
  const handleProceedToCheckout = () => {
    if (isShowtimeExpired) {
      setErrorMsg('This screening showtime has already passed. Please choose an upcoming showtime.');
      return;
    }

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

  if (loadingContext || !movie || !hall) {
    return (
      <div className="bg-[#09090b] text-white min-h-screen flex flex-col font-sans antialiased">
        <Navbar onBookNowClick={() => navigate('/movies')} onSearchClick={() => navigate('/movies')} />
        <main className="flex-1 flex items-center justify-center pt-24 pb-20">
          <div className="flex items-center gap-3 text-zinc-400">
            <RefreshCw className="w-5 h-5 animate-spin text-red-500" />
            <span className="text-sm">Loading auditorium seating layout...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => navigate('/movies')}
        onSearchClick={() => navigate('/movies')}
      />

      {/* Main Container */}
      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto w-full space-y-8">
        
        {/* ── Breadcrumb & Top Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d10] border border-white/10 p-4 sm:p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white rounded-xl transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{movie.title}</span>
                <span className="px-2 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-black uppercase">
                  {format}
                </span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <span className="text-white font-medium">{hall.name}</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <Calendar className="w-3.5 h-3.5 text-red-500" />
                  {showDate}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-zinc-300 font-bold">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  {showTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-xl border border-white/10">
            <Armchair className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-white">
              Selected: <strong className="text-red-500">{selectedSeatIds.length}</strong> / 8 Seats
            </span>
          </div>
        </div>

        {isShowtimeExpired && (
          <div className="p-4 bg-red-950/60 border border-red-500 text-red-300 text-sm rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>
                <strong>Screening Passed:</strong> This showtime ({showDate} at {showTime}) has already passed in real-time. Reservations are closed.
              </span>
            </div>
            <button
              onClick={() => navigate(`/movie/${movie.id}`)}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 cursor-pointer shadow-md"
            >
              Browse Active Showtimes
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-400 text-sm rounded-xl flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── Main Interactive Layout: Seating Plan & Checkout Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left/Center (8 cols): Real Movie Hall & Seating Map ── */}
          <div className="lg:col-span-8 bg-[#0d0d10] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-10 overflow-hidden relative">
            
            {/* ── Curved Projector Cinema Screen ── */}
            <div className="relative w-full max-w-xl mx-auto flex flex-col items-center pt-2 select-none">
              {/* Glowing Curved Screen Bar */}
              <div className="w-full h-3 rounded-full bg-gradient-to-r from-red-600/40 via-white/90 to-red-600/40 shadow-[0_0_35px_rgba(229,9,20,0.5)] border-t border-white" />
              
              {/* Projector Light Beam Cone */}
              <div className="w-full h-24 bg-gradient-to-b from-white/10 via-red-600/5 to-transparent pointer-events-none blur-sm" />
              
              <div className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500 mt-1 text-center">
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
                    <span className="w-5 text-xs font-black text-zinc-500 text-center font-mono">
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
                                ? 'bg-zinc-900/30 border border-zinc-800/40 text-zinc-700 cursor-not-allowed opacity-40'
                                : isSelected
                                ? 'bg-red-600 border-2 border-white text-white shadow-[0_0_15px_rgba(229,9,20,0.8)] scale-110 z-10 font-bold'
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
                                ? 'bg-zinc-900/30 border border-zinc-800/40 text-zinc-700 cursor-not-allowed opacity-40'
                                : isSelected
                                ? 'bg-red-600 border-2 border-white text-white shadow-[0_0_15px_rgba(229,9,20,0.8)] scale-110 z-10 font-bold'
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
                    <span className="w-5 text-xs font-black text-zinc-500 text-center font-mono">
                      {rowLetter}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── Legend Bar ── */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-zinc-950 border border-zinc-700/50" />
                <span>Available</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-600 border border-white shadow-sm" />
                <span className="font-bold text-white">Selected</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-zinc-900/40 border border-zinc-800 opacity-40" />
                <span className="text-zinc-600">Occupied</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-950/30 border border-amber-500/50" />
                <span>VIP (Rs. {resolvedPrices.VIP})</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-zinc-900/60 border border-zinc-500/50" />
                <span>Executive (Rs. {resolvedPrices.Executive})</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-zinc-950 border border-zinc-700/50" />
                <span>Standard (Rs. {resolvedPrices.Standard})</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-950/30 border border-red-600/50" />
                <span>Couple (Rs. {resolvedPrices.Couple})</span>
              </div>
            </div>
          </div>

          {/* ── Right (4 cols): Order Summary & Checkout Drawer ── */}
          <div className="lg:col-span-4 bg-[#0d0d10] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-white">Booking Summary</h3>
              </div>
              <span className="text-xs font-bold text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded-full border border-white/10">
                {format}
              </span>
            </div>

            {/* Movie Card Snippet */}
            <div className="flex items-start gap-3 p-3 bg-zinc-950 rounded-xl border border-white/5">
              <img
                src={movie.posterUrl || movie.backdropUrl}
                alt={movie.title}
                className="w-16 h-22 object-cover rounded-xl border border-white/10 shrink-0 shadow-md"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="font-bold text-sm text-white truncate">{movie.title}</h4>
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  <Tv className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="truncate">{hall.name}</span>
                </p>
                <p className="text-xs text-zinc-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{showDate} · {showTime}</span>
                </p>
              </div>
            </div>

            {/* Selected Seats Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Selected Seats ({selectedSeatsList.length})
              </span>

              {selectedSeatsList.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-950 border border-dashed border-white/10 text-center text-xs text-zinc-500">
                  Tap on any available seat in the auditorium to reserve.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {selectedSeatsList.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 font-bold flex items-center justify-center text-[10px]">
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
            <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Tickets Subtotal</span>
                <span className="text-white font-bold">Rs. {ticketsSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Digital Service & Booking Fee</span>
                <span className="text-white font-bold">Rs. {bookingFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm">
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
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Checkout (Rs. {grandTotal.toFixed(2)})</span>
            </button>

            <p className="text-[11px] text-center text-zinc-400 flex items-center justify-center gap-1">
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
