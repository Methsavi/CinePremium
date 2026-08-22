import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { HERO_MOVIE, NOW_PLAYING_MOVIES, COMING_SOON_FEATURE, COMING_SOON_STACK } from '@/data/movies';
import { Movie, Cinema } from '@/types/movie';
import { Navbar } from '@/components/Navbar';
import MovieDetails from './components/MovieDetails';
import { QuickBookingModal } from '@/components/QuickBookingModal';
import { TrailerModal } from '@/components/TrailerModal';
import { MyTicketsModal, BookingRecord } from '@/components/MyTicketsModal';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export default function SingleMovieListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const allMovies = [HERO_MOVIE, ...NOW_PLAYING_MOVIES, COMING_SOON_FEATURE, ...COMING_SOON_STACK];
  const movie = allMovies.find((m) => m.id === id) || HERO_MOVIE;

  // Modals state
  const [bookingMovie, setBookingMovie] = useState<Movie | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState<boolean>(false);
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);

  const handleBookingSuccess = (newBooking: BookingRecord) => {
    setUserBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setUserBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleBookClick = (selectedMovie: Movie) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: location.pathname } });
      return;
    }
    setBookingMovie(selectedMovie);
  };

  const handleSelectShowtime = (_cinema: Cinema, _showtimeId: string) => {
    handleBookClick(movie);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => handleBookClick(movie)}
        onSearchClick={() => navigate('/')}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
      />

      {/* Main Page Details */}
      <main className="flex-1 w-full">
        <MovieDetails
          movie={movie}
          onBookClick={handleBookClick}
          onTrailerClick={setTrailerUrl}
          onSelectShowtime={handleSelectShowtime}
        />
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

      {/* My Tickets Modal */}
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