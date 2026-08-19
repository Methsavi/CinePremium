import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HERO_MOVIE, NOW_PLAYING_MOVIES } from '@/data/movies';
import { Movie } from '@/types/movie';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SearchFilterSection } from './components/SearchFilterSection';
import { NowPlayingSection } from './components/NowPlayingSection';
import { ComingSoonSection } from './components/ComingSoonSection';
import { ExperienceSection } from './components/ExperienceSection';
import { QuickBookingModal } from '@/components/QuickBookingModal';
import { TrailerModal } from '@/components/TrailerModal';
import { MyTicketsModal, BookingRecord } from '@/components/MyTicketsModal';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // Modals
  const [bookingMovie, setBookingMovie] = useState<Movie | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState<boolean>(false);
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Filtered now playing movies
  const filteredNowPlaying = useMemo(() => {
    return NOW_PLAYING_MOVIES.filter((movie: Movie) => {
      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = movie.title.toLowerCase().includes(q);
        const matchesGenre = movie.genres.some((g: string) => g.toLowerCase().includes(q));
        if (!matchesTitle && !matchesGenre) return false;
      }

      // Genre filter
      if (selectedGenre !== 'All' && !movie.genres.includes(selectedGenre)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedGenre]);

  const handleBookingSuccess = (newBooking: BookingRecord) => {
    setUserBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setUserBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleRemindMe = (movie: Movie) => {
    setNotificationMsg(`Reminder set for "${movie.title}" (${movie.releaseDate})!`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleBookClick = (movie: Movie) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }
    setBookingMovie(movie);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary font-medium text-sm px-5 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          {notificationMsg}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => handleBookClick(HERO_MOVIE)}
        onSearchClick={() => {
          const el = document.getElementById('search-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onBookClick={() => handleBookClick(HERO_MOVIE)}
          onTrailerClick={setTrailerUrl}
        />

        {/* Content Container */}
        <div id="search-section" className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-12 pb-12">
          {/* Search & Filters */}
          <SearchFilterSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
          />

          {/* Now Playing Section */}
          <NowPlayingSection
            movies={filteredNowPlaying}
            onBookMovie={handleBookClick}
          />

          {/* Cinematic Experiences (IMAX, Dolby, 4DX) */}
          <ExperienceSection />

          {/* Coming Soon Section (Bento Grid) */}
          <ComingSoonSection onRemindMe={handleRemindMe} />
        </div>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Booking Modal */}
      {bookingMovie && (
        <QuickBookingModal
          movie={bookingMovie}
          onClose={() => setBookingMovie(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Trailer Modal */}
      {trailerUrl && (
        <TrailerModal
          trailerUrl={trailerUrl}
          onClose={() => setTrailerUrl(null)}
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

export default HomePage;
