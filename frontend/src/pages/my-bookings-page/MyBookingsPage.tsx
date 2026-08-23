import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { bookingApi } from '../../services/bookingApi';
import { getMovies } from '../../services/movieApi';
import { Movie } from '../../types/movie';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      setToastMessage(`Booking for "${movieTitle}" has been cancelled.`);
      setTimeout(() => setToastMessage(null), 4000);

      addNotification({
        type: 'cancel',
        title: 'Booking Cancelled',
        message: `Your booking for "${movieTitle}" (ID: ${id}) was successfully cancelled.`,
        actionUrl: '/my-bookings',
        actionLabel: 'View Bookings'
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel booking');
      addNotification({
        type: 'error',
        title: 'Cancellation Failed',
        message: err instanceof Error ? err.message : 'Failed to cancel booking.'
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handlePrintTicket = (_booking: BookingDisplayItem) => {
    window.print();
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased selection:bg-primary selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-medium text-xs sm:text-sm px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => navigate('/movies')}
        onSearchClick={() => navigate('/movies')}
      />

      {/* Main Page Content */}
      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto w-full space-y-8">
        
        {/* ── Page Header / Hero Banner ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0c1324] via-[#151b2d] to-[#0c1324] border border-white/10 p-6 sm:p-10 shadow-2xl">
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 max-w-3xl space-y-3">
          

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-tight">
              My <span className="text-primary">Bookings</span> & Tickets
            </h1>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Manage your upcoming cinema screenings, view digital QR tickets, check seating reservations, and track your ticket history.
            </p>
          </div>
        </div>

        {/* ── Not Logged In State ── */}
        {!isAuthenticated ? (
          <div className="bg-[#151b2d] border border-white/10 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto text-primary shadow-[0_0_20px_rgba(229,9,20,0.2)]">
              <LogIn className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Sign In to View Your Bookings</h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Your booked tickets and reservation history are securely linked to your CinePremium account.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/login"
                state={{ returnTo: '/my-bookings' }}
                className="liquid-glow-btn w-full sm:w-auto text-surface-container-lowest font-bold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Account</span>
              </Link>
              <Link
                to="/register"
                className="liquid-glass-btn w-full sm:w-auto text-white hover:text-primary font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <span>Create New Account</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Filter Bar & Actions ── */}
            <div className="bg-surface-container/80 border border-outline-variant/60 rounded-2xl p-4 md:p-5 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-[#0c1324] border border-[#2e3447] p-1 rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  All ({bookings.length})
                </button>

                <button
                  onClick={() => setFilterStatus('confirmed')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === 'confirmed'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
                </button>

                <button
                  onClick={() => setFilterStatus('cancelled')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === 'cancelled'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  Cancelled ({bookings.filter((b) => b.status === 'cancelled').length})
                </button>
              </div>

              {/* Refresh Button */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={fetchUserBookings}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0c1324] hover:bg-[#151b2d] border border-[#2e3447] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
                  <span>Refresh Bookings</span>
                </button>
              </div>
            </div>

            {/* ── Bookings List ── */}
            {loading ? (
              <div className="p-20 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3 bg-[#151b2d] rounded-3xl border border-outline-variant/60 shadow-xl">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-semibold text-white">Loading your cinema bookings from database...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-16 text-center text-on-surface-variant flex flex-col items-center justify-center gap-4 bg-[#151b2d] rounded-3xl border border-outline-variant/60 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-surface-variant border border-outline-variant flex items-center justify-center text-primary">
                  <Ticket className="w-8 h-8 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">No Bookings Found</h3>
                  <p className="text-xs text-on-surface-variant max-w-sm">
                    {filterStatus === 'all'
                      ? "You haven't reserved any movie tickets yet. Browse what's now playing and experience the cinema!"
                      : `You don't have any ${filterStatus} bookings.`}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/movies')}
                  className="liquid-glow-btn text-surface-container-lowest font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Browse Now Playing Movies</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`relative bg-[#151b2d] border rounded-3xl p-5 sm:p-6 shadow-xl overflow-hidden flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 transition-all duration-300 ${
                      booking.status === 'cancelled'
                        ? 'border-rose-500/30 opacity-75 bg-[#151b2d]/60'
                        : 'border-[#2e3447] hover:border-primary/40'
                    }`}
                  >
                    {/* Left: Movie & Ticket Details */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 flex-1 min-w-0">
                      {booking.posterUrl ? (
                        <div className="relative w-20 h-28 sm:w-24 sm:h-36 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-md bg-[#0c1324]">
                          <img
                            src={booking.posterUrl}
                            alt={booking.movieTitle}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              // If posterUrl fails, fallback to backdropUrl or placeholder
                              if (booking.backdropUrl && e.currentTarget.src !== booking.backdropUrl) {
                                e.currentTarget.src = booking.backdropUrl;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-28 sm:w-24 sm:h-36 bg-[#0c1324] border border-[#2e3447] rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-md">
                          <Film className="w-8 h-8 opacity-60" />
                        </div>
                      )}

                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              booking.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {booking.status === 'confirmed' ? 'Confirmed Ticket' : 'Cancelled'}
                          </span>

                          {booking.format && (
                            <span className="px-2 py-0.5 rounded-full bg-[#c0c1ff]/10 text-[#c0c1ff] border border-[#c0c1ff]/30 text-[10px] font-bold">
                              {booking.format}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                          {booking.movieTitle}
                        </h3>

                        <div className="space-y-1 text-xs text-on-surface-variant">
                          <p className="flex items-center gap-1.5 text-white/90 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{booking.cinemaName}</span>
                          </p>

                          <p className="flex items-center gap-1.5 text-[#c7c4d7]">
                            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{booking.date} at {booking.showtimeTime}</span>
                          </p>

                          <p className="flex items-center gap-1.5 text-[#c7c4d7] pt-1">
                            <Ticket className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>
                              Seats:{' '}
                              <strong className="text-white">
                                {booking.seats && booking.seats.length > 0
                                  ? booking.seats.map((s) => s.id || `${s.row}${s.number}`).join(', ')
                                  : 'General Admission'}
                              </strong>{' '}
                              ({booking.seats.length} ticket{booking.seats.length !== 1 ? 's' : ''})
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: QR Code, Price & Actions */}
                    <div className="flex sm:flex-row lg:flex-col items-center sm:items-center lg:items-end justify-between lg:justify-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#2e3447] shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                          <QrCode className="w-10 h-10 text-slate-950" />
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-on-surface-variant block font-mono">
                            Ref: {booking.id.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-lg sm:text-xl font-black text-emerald-400">
                            Rs. {booking.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrintTicket(booking)}
                          title="Print Ticket Boarding Pass"
                          className="p-2 bg-[#0c1324] hover:bg-[#191f31] border border-[#2e3447] text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#c0c1ff]" />
                          <span className="hidden sm:inline">Print</span>
                        </button>

                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id, booking.movieTitle)}
                            disabled={cancellingId === booking.id}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Cancel this reservation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}

export default MyBookingsPage;
