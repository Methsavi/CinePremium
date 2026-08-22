import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { QuickBookingModal } from '../../components/QuickBookingModal';
import { CINEMAS, NOW_PLAYING_MOVIES, HERO_MOVIE } from '../../data/movies';
import { Cinema, Movie, Showtime } from '../../types/movie';
import { BookingRecord } from '../../components/MyTicketsModal';
import { MyTicketsModal } from '../../components/MyTicketsModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMovies } from '../../services/movieApi';
import { useAuth } from '../../context/AuthContext';
import { 
  MapPin, Star, Search, Navigation, Clock,
  RefreshCw
} from 'lucide-react';

export function CinemasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  
  // Movies state (fetched from backend)
  const [moviesList, setMoviesList] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState<boolean>(true);

  // Modal States
  const [bookingMovie, setBookingMovie] = useState<Movie | null>(null);
  const [bookingCinema, setBookingCinema] = useState<Cinema | null>(null);
  const [bookingShowtime, setBookingShowtime] = useState<Showtime | null>(null);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState<boolean>(false);
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);

  // Fetch movies on mount
  const loadMovies = async () => {
    try {
      setLoadingMovies(true);
      const data = await getMovies();
      setMoviesList(data.length > 0 ? data : NOW_PLAYING_MOVIES);
    } catch (err: any) {
      console.warn("Failed to fetch movies from API, using fallback data:", err.message);
      setMoviesList(NOW_PLAYING_MOVIES);
      // Don't show blocking error so app remains fully functional with fallback
    } finally {
      setLoadingMovies(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  // Filtered Cinemas
  const filteredCinemas = useMemo(() => {
    return CINEMAS.filter((cinema) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q || 
        cinema.name.toLowerCase().includes(q) || 
        cinema.location.toLowerCase().includes(q);

      const matchesLocation = 
        selectedLocation === 'All' || 
        cinema.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesLocation;
    });
  }, [searchQuery, selectedLocation]);

  // Handle Booking Success
  const handleBookingSuccess = (newBooking: BookingRecord) => {
    setUserBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setUserBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  // Helper to open Quick Booking modal
  const handleOpenBooking = (movie: Movie, cinema: Cinema, showtime: Showtime) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }
    setBookingMovie(movie);
    // Build a proper Cinema object to pass into modal
    const targetCinema: Cinema = {
      ...cinema,
      showtimes: [showtime] // pass only this showtime to pre-fill it cleanly
    };
    setBookingCinema(targetCinema);
    setBookingShowtime(showtime);
  };

  const handleBookClick = (movie: Movie) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }
    setBookingMovie(movie);
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
        onBookNowClick={() => handleBookClick(HERO_MOVIE)}
        onSearchClick={() => {
          const el = document.getElementById('search-cinemas-input');
          el?.focus();
        }}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-10">
          
          {/* Header Title */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              Live Cinema Screenings
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-display">
              All Cinemas & Currently Showing Movies
            </h1>
            <p className="text-sm text-on-surface-variant max-w-xl leading-relaxed">
              Browse registered movies fetched from the database, view showtimes customized per location, and select seats instantly.
            </p>
          </div>

          {/* Search & Location Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container/60 p-4 rounded-3xl border border-outline-variant/60 backdrop-blur-md">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
              <input
                id="search-cinemas-input"
                type="text"
                placeholder="Search cinemas by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-2xl text-sm text-on-background placeholder:text-on-surface-variant/50 pl-11 pr-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-on-surface-variant shrink-0 hidden md:inline">Area:</span>
              <div className="flex gap-1.5 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/50 w-full sm:w-auto overflow-x-auto">
                {locationsList.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      (loc === 'All' && selectedLocation === 'All') || selectedLocation.toLowerCase() === loc.toLowerCase()
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {loc === 'All' ? 'All Areas' : loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cinemas Listings containing Movie Cards */}
          <div className="space-y-12">
            {loadingMovies ? (
              <div className="py-24 text-center text-on-surface-variant/80 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm font-medium">Fetching cinema movie rosters...</span>
              </div>
            ) : filteredCinemas.length === 0 ? (
              <div className="text-center py-20 bg-surface-container/20 border border-dashed border-outline-variant/50 rounded-3xl space-y-3">
                <MapPin className="w-12 h-12 text-on-surface-variant/30 mx-auto" />
                <h3 className="text-base font-bold text-white">No Cinemas Found</h3>
                <p className="text-xs text-on-surface-variant">Try modifying your search or filter keywords.</p>
              </div>
            ) : (
              filteredCinemas.map((cinema) => {
                const amenities = cinemaAmenities[cinema.id] || [];
                const stats = cinemaRatings[cinema.id] || { score: 4.8, reviews: 100 };
                
                return (
                  <div 
                    key={cinema.id} 
                    className="bg-surface-container/60 border border-outline-variant/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm"
                  >
                    {/* Cinema Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/40 pb-5">
                      <div className="space-y-1 text-left">
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                          <Navigation className="w-5 h-5 text-primary shrink-0" />
                          {cinema.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {cinema.location}
                          </span>
                          <span>•</span>
                          <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            {cinema.distance}
                          </span>
                          <span>•</span>
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {stats.score}
                            <span className="text-[10px] text-on-surface-variant font-normal">({stats.reviews} ratings)</span>
                          </div>
                        </div>
                      </div>

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-1.5 self-start md:self-center">
                        {amenities.map((item) => (
                          <span key={item} className="text-[9px] font-bold bg-surface-container-high border border-outline-variant/60 text-on-surface-variant px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Movie Cards Row for this specific Cinema */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {moviesList.map((movie) => {
                        const showtimes = getMovieShowtimesForCinema(cinema.id, movie.id);
                        
                        return (
                          <div 
                            key={movie.id} 
                            className="bg-surface-container-low/90 border border-outline-variant/40 hover:border-primary/40 rounded-2xl p-4 flex flex-col justify-between transition-all group hover:scale-[1.01] hover:shadow-lg"
                          >
                            <div 
                              onClick={() => navigate(`/movie/${movie.id}`)}
                              className="space-y-4 cursor-pointer hover:opacity-95 transition-opacity"
                            >
                              {/* Movie Thumbnail Banner */}
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-high">
                                <img 
                                  src={movie.backdropUrl || movie.posterUrl} 
                                  alt={movie.title} 
                                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1324] via-transparent to-transparent opacity-85" />
                                
                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                                  <span className="text-[9px] font-extrabold bg-primary text-on-primary px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                                    {movie.genres?.[0] || 'Drama'}
                                  </span>
                                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-[#0c1324]/85 px-2 py-0.5 rounded-md border border-white/5 backdrop-blur-sm">
                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                    {movie.rating}
                                  </div>
                                </div>
                              </div>

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
                                    <span className="text-[8px] text-[#908fa0] font-bold mt-0.5">
                                      {st.format} • ${st.price.toFixed(2)}
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

      {/* Booking Modal */}
      {bookingMovie && (
        <QuickBookingModal
          movie={bookingMovie}
          initialCinema={bookingCinema}
          initialShowtime={bookingShowtime}
          onClose={() => {
            setBookingMovie(null);
            setBookingCinema(null);
            setBookingShowtime(null);
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

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
