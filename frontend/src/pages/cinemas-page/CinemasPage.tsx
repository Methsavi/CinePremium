import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHalls } from '../../services/hallApi';
import { getMovies } from '../../services/movieApi';
import { getShowtimes } from '../../services/showtimeApi';
import { CinemaHall } from '../../types/hall';
import { Movie } from '../../types/movie';
import { Showtime } from '../../types/showtime';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { MyTicketsModal } from '../../components/MyTicketsModal';
import {
  Clock,
  Sparkles,
  Search,
  Compass,
  Tv,
  Armchair,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

import { useNotification } from '../../context/NotificationContext';

export function CinemasPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // Database Data States
  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('All');

  // My Tickets Modal State
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);
  const [userBookings, setUserBookings] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cp_user_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleCancelBooking = (bookingId: string) => {
    const updated = userBookings.filter((b) => b.id !== bookingId);
    setUserBookings(updated);
    localStorage.setItem('cp_user_bookings', JSON.stringify(updated));
    addNotification({ message: 'Cancelled Successfully', type: 'cancel' });
  };

  // Fetch all cinema halls, movies, and showtimes directly from database APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hallsData, moviesData, showtimesData] = await Promise.all([
          getHalls().catch(() => [] as CinemaHall[]),
          getMovies().catch(() => [] as Movie[]),
          getShowtimes().catch(() => [] as Showtime[])
        ]);
        setHalls(hallsData || []);
        setMovies(moviesData || []);
        setShowtimes(showtimesData || []);
      } catch (err) {
        console.error('Failed to load cinema data from database API:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Screen formats available
  const availableFormats = useMemo(() => {
    const set = new Set<string>();
    halls.forEach((h) => {
      if (h.screenType) set.add(h.screenType);
    });
    return ['All', ...Array.from(set)];
  }, [halls]);

  // Filter Halls based on search query and screen format
  const filteredHalls = useMemo(() => {
    return halls.filter((hall) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = hall.name?.toLowerCase().includes(q);
        const matchesScreen = hall.screenType?.toLowerCase().includes(q);
        if (!matchesName && !matchesScreen) return false;
      }

      if (selectedFormat !== 'All') {
        if (hall.screenType !== selectedFormat) return false;
      }

      return true;
    });
  }, [halls, searchQuery, selectedFormat]);

  // Navigate to seat selection with hall and movie details
  const handleOpenBooking = (hall: CinemaHall, movie: Movie, showtime?: Showtime) => {
    navigate('/seat-selection', {
      state: {
        movie,
        hall,
        showtimeId: showtime?.id || `st-${movie.id}-${hall.id}`,
        showDate: showtime?.showDate || new Date().toISOString().split('T')[0],
        showTime: showtime?.showTime || '07:30 PM',
        format: showtime?.format || hall.screenType || 'Standard 2D',
        tierPrices: showtime?.tierPrices || hall.seatTiers || [
          { tierName: 'VIP Recliner', price: 22 },
          { tierName: 'Standard', price: 15 }
        ]
      }
    });
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => navigate('/movies')}
        onSearchClick={() => {
          const el = document.getElementById('search-cinemas-input');
          el?.focus();
        }}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto w-full space-y-12">

        {/* ── Hero Banner ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#121829] via-surface-container to-[#121829] border border-outline-variant/60 p-6 sm:p-12 shadow-2xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(229,9,20,0.2)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>State of the Art Auditoriums</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Our Premiere <span className="text-primary">Cinema</span> Auditoriums
            </h1>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Explore configured luxury auditoriums, laser 4K projection formats, and live showtime screenings across our cinema network.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-4 bg-surface-container-high/60 backdrop-blur-xl p-4 rounded-2xl border border-outline-variant/60 shadow-xl">
            <div className="text-center px-4 border-r border-outline-variant">
              <span className="text-2xl font-black text-white">{halls.length}</span>
              <span className="block text-[10px] text-on-surface-variant uppercase font-bold">Halls Live</span>
            </div>
            <div className="text-center px-4 border-r border-outline-variant">
              <span className="text-2xl font-black text-primary">{movies.length}</span>
              <span className="block text-[10px] text-on-surface-variant uppercase font-bold">Movies DB</span>
            </div>
            <div className="text-center px-4">
              <span className="text-2xl font-black text-amber-400">{showtimes.length}</span>
              <span className="block text-[10px] text-on-surface-variant uppercase font-bold">Showtimes</span>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="bg-surface-container/80 border border-outline-variant/60 rounded-2xl p-4 md:p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                id="search-cinemas-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search auditorium name or screen format..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Format Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs text-on-surface-variant font-bold flex items-center gap-1 shrink-0">
                <Tv className="w-3 h-3 text-primary" />
                Format:
              </span>
              {availableFormats.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedFormat === fmt
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-white hover:bg-surface-variant'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Cinema Auditoriums List ── */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
              <Compass className="w-5 h-5 text-primary" />
              <span>Configured Cinema Halls ({filteredHalls.length})</span>
            </h2>
            <span className="text-xs text-on-surface-variant">Live database records</span>
          </div>

          {loading ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm font-semibold text-white">Loading auditoriums from database...</span>
            </div>
          ) : filteredHalls.length === 0 ? (
            <div className="p-16 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3 bg-surface rounded-2xl border border-outline-variant/40">
              <Tv className="w-8 h-8 text-primary opacity-60" />
              <p className="text-sm font-semibold text-white">No cinema halls match your search query.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFormat('All');
                }}
                className="mt-2 text-xs text-primary font-bold hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {filteredHalls.map((hall) => {
                // Find all showtimes assigned to this hall
                const hallShowtimes = showtimes.filter((st: any) => {
                  const hId = typeof st.hall === 'object' ? st.hall?.id || st.hall?._id : st.hall;
                  return hId === hall.id;
                });

                // Find movies that have showtimes in this hall (or top database movies)
                const scheduledMovieIds = new Set(
                  hallShowtimes.map((st: any) =>
                    typeof st.movie === 'object' ? st.movie?.id || st.movie?._id : st.movie
                  )
                );

                const moviesInHall = movies.filter((m) => scheduledMovieIds.has(m.id)).slice(0, 3);
                const displayMovies = moviesInHall.length > 0 ? moviesInHall : movies.slice(0, 3);

                return (
                  <div
                    key={hall.id}
                    className="bg-surface-container/60 border border-outline-variant/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl hover:border-primary/40 transition-all duration-300 space-y-6"
                  >
                    {/* Hall Header info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/40">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-2xl font-black text-white font-display">{hall.name}</h2>
                          <span className="px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-black uppercase">
                            {hall.screenType || 'Standard 2D'}
                          </span>
                        </div>

                        <p className="text-xs text-on-surface-variant flex items-center gap-2">
                          <Armchair className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{hall.totalCapacity || 100} Seating Capacity</span>
                          <span>•</span>
                          <span>{hall.seatTiers?.length || 1} Pricing Tier{(hall.seatTiers?.length || 1) > 1 ? 's' : ''}</span>
                        </p>
                      </div>

                      {/* Tier Badges */}
                      <div className="flex flex-wrap gap-2">
                        {hall.seatTiers && hall.seatTiers.length > 0 ? (
                          hall.seatTiers.map((tier) => (
                            <span
                              key={tier.tierName}
                              className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-xs font-medium text-zinc-300 flex items-center gap-1.5"
                            >
                              <span>{tier.tierName}:</span>
                              <strong className="text-emerald-400 font-mono">Rs. {Number(tier.price || 15).toFixed(2)}</strong>
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-xs font-medium text-emerald-400">
                            Standard Rate: Rs. 1,500.00
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Movies Currently Screening in This Auditorium */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                        Featured Screening Titles:
                      </span>

                      {displayMovies.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic py-2">
                          No active movies in database. Add movies in the Manager Panel.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {displayMovies.map((movie) => {
                            const specificShowtimes = hallShowtimes.filter((st: any) => {
                              const mId = typeof st.movie === 'object' ? st.movie?.id || st.movie?._id : st.movie;
                              return mId === movie.id;
                            });

                            return (
                              <div
                                key={movie.id}
                                className="bg-surface-container-lowest/80 border border-outline-variant/60 rounded-2xl p-4 flex flex-col justify-between hover:border-primary/50 transition-all group"
                              >
                                {/* Poster + Meta */}
                                <div className="flex gap-3 items-center">
                                  <img
                                    src={movie.posterUrl || movie.backdropUrl}
                                    alt={movie.title}
                                    className="w-14 h-20 object-cover rounded-xl border border-white/10 shrink-0 shadow-md group-hover:scale-105 transition-transform"
                                  />

                                  {/* Title & Info */}
                                  <div className="space-y-1 text-left min-w-0">
                                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                                      {movie.title}
                                    </h3>
                                    <p className="text-[10px] text-on-surface-variant flex items-center gap-1 font-medium">
                                      <Clock className="w-3 h-3 shrink-0" />
                                      <span>{movie.duration || '2h 00m'}</span>
                                      {movie.genres && movie.genres.length > 0 && (
                                        <span>• {movie.genres.slice(0, 2).join(', ')}</span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* Booking Button */}
                                <div className="pt-3.5 border-t border-outline-variant/30 mt-4 text-left">
                                  <button
                                    onClick={() => handleOpenBooking(hall, movie, specificShowtimes[0])}
                                    className="w-full py-2 px-3 bg-surface-container-high/80 border border-outline-variant hover:border-primary hover:bg-primary text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                                  >
                                    <Armchair className="w-3.5 h-3.5" />
                                    <span>Book Seats</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* My Tickets History Modal */}
      {isMyTicketsOpen && (
        <MyTicketsModal
          bookings={userBookings}
          onClose={() => setIsMyTicketsOpen(false)}
          onCancelBooking={handleCancelBooking}
        />
      )}
    </div>
  );
}

export default CinemasPage;
