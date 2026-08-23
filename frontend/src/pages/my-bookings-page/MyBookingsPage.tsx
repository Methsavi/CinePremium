import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { bookingApi } from '../../services/bookingApi';
import { getMovies } from '../../services/movieApi';
import { Movie } from '../../types/movie';
import { PrintTicketsModal } from './components/PrintTicketsModal';
import { BarcodeSVG } from './components/BarcodeSVG';
import {
  Ticket,
  QrCode,
  Calendar,
  MapPin,
  Trash2,
  CheckCircle2,
  Sparkles,
  LogIn,
  RefreshCw,
  Printer,
  Film,
  Clock,
  Armchair
} from 'lucide-react';

interface SeatItem {
  id: string;
  row?: string;
  number?: number;
  type?: string;
  price?: number;
}

export interface BookingDisplayItem {
  id: string;
  bookingId?: string;
  movieId?: string;
  movieTitle: string;
  posterUrl?: string;
  backdropUrl?: string;
  cinemaName: string;
  date: string;
  showtimeTime: string;
  format?: string;
  seats: SeatItem[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled';
  createdAt?: string;
}

export function MyBookingsPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { addNotification } = useNotification();

  const [bookings, setBookings] = useState<BookingDisplayItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch bookings and real movie records from database API
  const fetchUserBookings = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user bookings and database movies simultaneously
      const [bookingsResponse, dbMovies] = await Promise.all([
        bookingApi.getMyBookings(token),
        getMovies().catch(() => [] as Movie[])
      ]);

      const serverBookings = bookingsResponse.data.bookings || [];

      // Transform and correlate with database movie records
      const formatted: BookingDisplayItem[] = serverBookings.map((b: any) => {
        // Find corresponding movie from database
        const matchedMovie = dbMovies.find(
          (m: Movie) =>
            m.id === b.movieId ||
            (m as any)._id === b.movieId ||
            m.title?.toLowerCase() === b.movieTitle?.toLowerCase()
        );

        // Resolve highest resolution poster or backdrop from database
        const resolvedPoster =
          matchedMovie?.posterUrl ||
          b.posterUrl ||
          matchedMovie?.backdropUrl ||
          '';

        const resolvedBackdrop =
          matchedMovie?.backdropUrl ||
          matchedMovie?.posterUrl ||
          '';

        return {
          id: b.bookingId || b._id,
          bookingId: b.bookingId || b._id,
          movieId: b.movieId,
          movieTitle: b.movieTitle || matchedMovie?.title || 'Movie Screening',
          posterUrl: resolvedPoster,
          backdropUrl: resolvedBackdrop,
          cinemaName: b.cinemaName || 'CinePremium Main Cinema',
          date: b.date || 'Today',
          showtimeTime: b.showtimeTime || '07:30 PM',
          format: b.format || 'Standard 2D',
          seats: b.seats || [],
          totalAmount: b.totalAmount || 0,
          status: b.status || 'confirmed',
          createdAt: b.createdAt
        };
      });

      setBookings(formatted);
    } catch (err) {
      console.warn('Failed to fetch from booking API:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserBookings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const handleCancelBooking = async (id: string, movieTitle: string) => {
    if (!window.confirm(`Are you sure you want to cancel your booking for "${movieTitle}"?`)) {
      return;
    }

    try {
      setCancellingId(id);
      if (token) {
        await bookingApi.cancelBooking(token, id);
      }
      // Update locally
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
      );

      addNotification({
        type: 'cancel',
        message: 'Cancelled Successfully',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Cancellation Failed',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const [printingBooking, setPrintingBooking] = useState<BookingDisplayItem | null>(null);

  const handlePrintTicket = (booking: BookingDisplayItem) => {
    setPrintingBooking(booking);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white">

      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => navigate('/movies')}
        onSearchClick={() => navigate('/movies')}
      />

      {/* Main Page Content */}
      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto w-full space-y-6">
        
        {/* ── Page Heading ── */}
        <div className="pt-2 sm:pt-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            My <span className="text-red-500">Bookings</span> & Tickets
          </h1>
        </div>

        {/* ── Not Logged In State ── */}
        {!isAuthenticated ? (
          <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-500 shadow-[0_0_20px_rgba(229,9,20,0.2)]">
              <LogIn className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Sign In to View Your Bookings</h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Your booked tickets and reservation history are securely linked to your CinePremium account.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/login"
                state={{ returnTo: '/my-bookings' }}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Account</span>
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <span>Create New Account</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Filter Bar ── */}
            <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-4 md:p-5 shadow-xl flex items-center justify-between gap-4">
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-white/10 p-1 rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All ({bookings.length})
                </button>

                <button
                  onClick={() => setFilterStatus('confirmed')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === 'confirmed'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
                </button>

                <button
                  onClick={() => setFilterStatus('cancelled')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === 'cancelled'
                      ? 'bg-red-700 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Cancelled ({bookings.filter((b) => b.status === 'cancelled').length})
                </button>
              </div>
            </div>

            {/* ── Bookings List ── */}
            {loading ? (
              <div className="p-20 text-center text-zinc-400 flex flex-col items-center justify-center gap-3 bg-[#0d0d10] rounded-2xl border border-white/10 shadow-xl">
                <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-sm font-semibold text-white">Loading your cinema bookings from database...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-4 bg-[#0d0d10] rounded-2xl border border-white/10 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-red-500">
                  <Ticket className="w-8 h-8 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">No Bookings Found</h3>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    {filterStatus === 'all'
                      ? "You haven't reserved any movie tickets yet. Browse what's now playing and experience the cinema!"
                      : `You don't have any ${filterStatus} bookings.`}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/movies')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Browse Now Playing Movies</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((booking) => {
                  const rawSeats = booking.seats && booking.seats.length > 0 ? booking.seats : [{ id: 'GA-01' }];
                  const cleanBookingId = (booking.id || 'BK').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                  const sampleBarcode = `X${cleanBookingId.slice(-6)}E0601826`;

                  return (
                    <div
                      key={booking.id}
                      className={`relative bg-[#0d0d10] border rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row items-stretch justify-between transition-all duration-300 ${
                        booking.status === 'cancelled'
                          ? 'border-red-500/30 opacity-75 bg-[#0d0d10]/60'
                          : 'border-white/15 hover:border-red-500/40'
                      }`}
                    >
                      {/* ── Main Ticket Body (Left / Center) ── */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 sm:p-7 flex-1 min-w-0">
                        {/* Movie Poster Artwork */}
                        <div className="relative w-24 h-36 sm:w-28 sm:h-40 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-zinc-950">
                          {booking.posterUrl ? (
                            <img
                              src={booking.posterUrl}
                              alt={booking.movieTitle}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                if (booking.backdropUrl && e.currentTarget.src !== booking.backdropUrl) {
                                  e.currentTarget.src = booking.backdropUrl;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-red-500">
                              <Film className="w-8 h-8 opacity-60" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[8px] font-black uppercase text-white border border-white/20">
                            CINEPREMIUM
                          </div>
                        </div>

                        {/* Ticket Information */}
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                booking.status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
                              }`}
                            >
                              {booking.status === 'confirmed' ? 'Confirmed Ticket' : 'Cancelled'}
                            </span>

                            {booking.format && (
                              <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-white/10 text-[10px] font-bold uppercase">
                                {booking.format}
                              </span>
                            )}

                            <span className="text-[10px] font-mono text-zinc-500">
                              Ref: {booking.id}
                            </span>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                            {booking.movieTitle}
                          </h3>

                          {/* Ticket Meta Details Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-y border-white/5 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Cinema / Screen</span>
                              <span className="font-bold text-white truncate block">{booking.cinemaName}</span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Date</span>
                              <span className="font-bold text-white block">{booking.date}</span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Time</span>
                              <span className="font-bold text-white block">{booking.showtimeTime}</span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Paid</span>
                              <span className="font-black text-emerald-400 block text-sm">Rs. {booking.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Seats Row */}
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                              <Armchair className="w-3.5 h-3.5 text-red-500" />
                              <span>Seats ({rawSeats.length}):</span>
                            </span>
                            {rawSeats.map((s: any, idx: number) => {
                              const sId = typeof s === 'string' ? s : s.id || `${s.row || ''}${s.number || ''}`;
                              return (
                                <span
                                  key={sId + idx}
                                  className="px-2.5 py-0.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-black font-mono shadow-sm"
                                >
                                  {sId}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* ── Perforated Tear Divider (Top/Bottom Notches + Dashed Line) ── */}
                      <div className="relative hidden lg:flex flex-col items-center justify-between w-6 shrink-0 my-0">
                        {/* Top Notch */}
                        <div
                          className="w-7 h-7 rounded-full bg-[#09090b] -mt-3.5 border-b border-white/20 z-10"
                          style={{ boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.3)' }}
                        />

                        {/* Dashed Perforation Line */}
                        <div className="w-[1px] h-full border-r-2 border-dashed border-white/20 my-1" />

                        {/* Bottom Notch */}
                        <div
                          className="w-7 h-7 rounded-full bg-[#09090b] -mb-3.5 border-t border-white/20 z-10"
                          style={{ boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.3)' }}
                        />
                      </div>

                      {/* ── Ticket Stub / Verification & Actions (Right) ── */}
                      <div className="bg-zinc-950/90 p-5 sm:p-6 flex flex-col justify-between items-center w-full lg:w-72 shrink-0 border-t lg:border-t-0 border-white/10 space-y-4">
                        {/* Barcode graphic */}
                        <div className="w-full text-zinc-300">
                          <BarcodeSVG
                            code={sampleBarcode}
                            barColor="#f4f4f5"
                            textColor="text-zinc-400"
                            className="w-full h-9"
                          />
                        </div>

                        {/* QR Code + Ref */}
                        <div className="flex items-center justify-between w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-white rounded-lg shadow-md shrink-0">
                              <QrCode className="w-8 h-8 text-slate-950" />
                            </div>
                            <div className="text-left">
                              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Entry Pass</span>
                              <span className="text-xs font-bold text-white">{rawSeats.length} {rawSeats.length === 1 ? 'Ticket' : 'Tickets'}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] font-mono text-zinc-500 block">Status</span>
                            <span className={`text-[10px] font-black uppercase ${booking.status === 'confirmed' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full space-y-2">
                          <button
                            onClick={() => handlePrintTicket(booking)}
                            title="Print Individual Ticket Passes for this Booking"
                            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition-all cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                            <span>Print Tickets ({rawSeats.length})</span>
                          </button>

                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id, booking.movieTitle)}
                              disabled={cancellingId === booking.id}
                              className="w-full py-2 px-3 bg-zinc-900 hover:bg-red-950/40 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Separate Individual Tickets Print Modal ── */}
      <PrintTicketsModal
        booking={printingBooking}
        isOpen={!!printingBooking}
        onClose={() => setPrintingBooking(null)}
      />

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}

export default MyBookingsPage;
