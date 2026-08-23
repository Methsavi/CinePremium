import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CINEMAS, NOW_PLAYING_MOVIES, HERO_MOVIE } from '../../data/movies';
import { Cinema, Movie, Showtime } from '../../types/movie';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { MyTicketsModal } from '../../components/MyTicketsModal';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Clock,
  Sparkles,
  Search,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  Navigation,
  Compass
} from 'lucide-react';

export function CinemasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedAmenity, setSelectedAmenity] = useState('All');

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    setToastMessage('Booking cancelled successfully.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter Cinemas based on search, location, and amenity
  const filteredCinemas = useMemo(() => {
    return CINEMAS.filter((cinema) => {
      // Search matching name or location
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = cinema.name.toLowerCase().includes(query);
        const matchesLocation = cinema.location.toLowerCase().includes(query);
        if (!matchesName && !matchesLocation) return false;
      }

      // Location Filter
      if (selectedLocation !== 'All') {
        if (!cinema.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // Amenity Filter
      if (selectedAmenity !== 'All') {
        const amenities = cinemaAmenities[cinema.id] || [];
        if (!amenities.includes(selectedAmenity)) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedLocation, selectedAmenity]);

  // Navigate directly to the auditorium seat selection page with the chosen cinema and showtime slot
  const handleOpenBooking = (movie: Movie, cinema: Cinema, showtime: Showtime) => {
    navigate('/seat-selection', {
      state: {
        movie,
        hall: { id: cinema.id, name: `${cinema.name} — ${showtime.hall || 'Main Auditorium'}`, screenType: showtime.format },
        showtimeId: showtime.id,
        showDate: new Date().toISOString().split('T')[0],
        showTime: showtime.time,
        format: showtime.format,
        tierPrices: [
          { tierName: 'VIP Recliner', price: 22 },
          { tierName: 'Executive', price: 18 },
          { tierName: 'Standard', price: 14 }
        ]
      }
    });
  };

  const handleBookClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  // Predefined Locations for filter
  const locationsList = ['All', 'Downtown', 'Mall'];

  // Custom Amenities for display
  const cinemaAmenities: Record<string, string[]> = {
    c1: ['IMAX 3D', 'Dolby Atmos', 'VIP Recliners', 'Valet Parking', 'Dine-In'],
    c2: ['4DX', 'RealD 3D', 'Dolby Atmos', 'Arcade Lounge', 'Kids Area']
  };

  // Custom Cinema Ratings
  const cinemaRatings: Record<string, { score: number, reviews: number }> = {
    c1: { score: 4.9, reviews: 248 },
    c2: { score: 4.7, reviews: 182 }
  };

  // Helper to generate consistent showtimes for movies at different locations
  const getMovieShowtimesForCinema = (cinemaId: string, movieId: string): Showtime[] => {
    const hash = (cinemaId + movieId).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const format = cinemaId === 'c1' ? 'IMAX' : (hash % 2 === 0 ? '3D' : '2D');
    const price = format === 'IMAX' ? 18.50 : format === '3D' ? 15.00 : 12.50;
    const hall = cinemaId === 'c1' ? 'Screen 1 (IMAX)' : (hash % 2 === 0 ? 'Screen 2 (3D)' : 'Screen 3');

    const time1Hour = 14 + (hash % 4);
    const time2Hour = 19 + (hash % 4);

    return [
      { id: `${cinemaId}-${movieId}-st1`, time: `${time1Hour}:30`, format, price, hall },
      { id: `${cinemaId}-${movieId}-st2`, time: `${time2Hour}:15`, format, price, hall }
    ];
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-medium text-sm px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto w-full space-y-12">

        {/* ── Hero Banner ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#121829] via-surface-container to-[#121829] border border-outline-variant/60 p-6 sm:p-12 shadow-2xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(229,9,20,0.2)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>State of the Art Theaters</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Our Premiere <span className="text-primary">Cinema</span> Halls
            </h1>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Immerse yourself in world-class cinematic excellence. Experience Dolby Atmos 360-degree acoustics, laser 4K projection, and plush VIP recliner seating.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-4 bg-surface-container-high/60 backdrop-blur-xl p-4 rounded-2xl border border-outline-variant/60 shadow-xl">
            <div className="text-center px-4 border-r border-outline-variant">
              <span className="text-2xl font-black text-white">4</span>
              <span className="block text-[10px] text-on-surface-variant uppercase font-bold">Theaters</span>
            </div>
            <div className="text-center px-4 border-r border-outline-variant">
              <span className="text-2xl font-black text-primary">IMAX</span>
              <span className="block text-[10px] text-on-surface-variant uppercase font-bold">Certified</span>
            </div>
            <div className="text-center px-4">
              <span className="text-2xl font-black text-amber-400">4.9★</span>
              <span className="block text-[10px] text-on-surface-variant uppercase font-bold">Guest Rating</span>
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
                placeholder="Search cinema location, branch name, or street..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Quick Location Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs text-on-surface-variant font-bold flex items-center gap-1 shrink-0">
                <Navigation className="w-3 h-3 text-primary" />
                Area:
              </span>
              {locationsList.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedLocation === loc
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-white hover:bg-surface-variant'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Cinema Locations List ── */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              <span>Available Locations ({filteredCinemas.length})</span>
            </h2>
            <span className="text-xs text-on-surface-variant">Real-time scheduling active</span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {filteredCinemas.length === 0 ? (
              <div className="p-16 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3 bg-surface rounded-2xl border border-outline-variant/40">
                <MapPin className="w-8 h-8 text-primary opacity-60" />
                <p className="text-sm font-semibold text-white">No cinema locations match your filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLocation('All');
                    setSelectedAmenity('All');
                  }}
                  className="mt-2 text-xs text-primary font-bold hover:underline"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredCinemas.map((cinema) => {
                const amenities = cinemaAmenities[cinema.id] || ['Dolby Atmos', 'Laser 4K', 'Recliners'];
                const rating = cinemaRatings[cinema.id] || { score: 4.8, reviews: 150 };

                return (
                  <div
                    key={cinema.id}
                    className="bg-surface-container/60 border border-outline-variant/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl hover:border-primary/40 transition-all duration-300 space-y-6"
                  >
                    {/* Cinema Header info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/40">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-2xl font-black text-white">{cinema.name}</h2>
                          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-amber-400 text-xs font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{rating.score}</span>
                            <span className="text-[10px] text-on-surface-variant">({rating.reviews})</span>
                          </div>
                        </div>

                        <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{cinema.location} • Open daily 10:00 AM - 12:30 AM</span>
                        </p>
                      </div>

                      {/* Amenities Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {amenities.map((am) => (
                          <span
                            key={am}
                            className="px-2.5 py-1 rounded-md bg-surface-container-high border border-outline-variant text-[10px] font-semibold text-on-surface-variant"
                          >
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Movies Currently Screening in This Cinema */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {NOW_PLAYING_MOVIES.slice(0, 3).map((movie) => {
                        const showtimes = getMovieShowtimesForCinema(cinema.id, movie.id);

                        return (
                          <div
                            key={movie.id}
                            className="bg-surface-container-lowest/80 border border-outline-variant/60 rounded-2xl p-4 flex flex-col justify-between hover:border-primary/50 transition-all group"
                          >
                            {/* Poster + Meta */}
                            <div className="flex gap-3 items-center">
                              <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-14 h-20 object-cover rounded-xl border border-white/10 shrink-0 shadow-md group-hover:scale-105 transition-transform"
                              />

                              {/* Title & Info */}
                              <div className="space-y-1 text-left">
                                <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                                  {movie.title}
                                </h3>
                                <p className="text-[10px] text-on-surface-variant flex items-center gap-1 font-medium">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  {movie.duration} • {movie.genres?.join(', ')}
                                </p>
                              </div>
                            </div>

                            {/* Showtimes Selector */}
                            <div className="space-y-2.5 pt-3.5 border-t border-outline-variant/30 mt-4 text-left">
                              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                                Screenings & Rates:
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                {showtimes.map((st) => (
                                  <button
                                    key={st.id}
                                    onClick={() => handleOpenBooking(movie, cinema, st)}
                                    className="flex flex-col items-center justify-center py-2 px-2 bg-surface-container-high/80 border border-outline-variant hover:border-primary/50 hover:bg-primary/10 rounded-xl text-center transition-all cursor-pointer group/btn"
                                  >
                                    <span className="text-xs font-black text-white group-hover/btn:text-primary">
                                      {st.time}
                                    </span>
                                    <span className="text-[8px] text-on-surface-variant font-bold mt-0.5">
                                      {st.format} • Rs. {st.price.toFixed(2)}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })
            )}
          </div>

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
