import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HERO_MOVIE, NOW_PLAYING_MOVIES, COMING_SOON_FEATURE, COMING_SOON_STACK } from '@/data/movies';
import { getMovieById, getMovies } from '@/services/movieApi';
import { Movie } from '@/types/movie';
import { Navbar } from '@/components/Navbar';
import MovieDetails from './components/MovieDetails';
import { TrailerModal } from '@/components/TrailerModal';
import { Footer } from '@/components/Footer';
import { RefreshCw } from 'lucide-react';

export default function SingleMovieListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const allFallbackMovies = [HERO_MOVIE, ...NOW_PLAYING_MOVIES, COMING_SOON_FEATURE, ...COMING_SOON_STACK];
  const initialMovie = allFallbackMovies.find((m) => m.id === id) || HERO_MOVIE;

  const [movie, setMovie] = useState<Movie>(initialMovie);
  const [loading, setLoading] = useState<boolean>(true);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Try getting single movie by ID from backend
        const fetchedMovie = await getMovieById(id);
        if (fetchedMovie) {
          setMovie(fetchedMovie);
        } else {
          // Fallback search in list
          const allDb = await getMovies();
          const found = allDb.find((m) => m.id === id);
          if (found) setMovie(found);
        }
      } catch (err) {
        console.warn('Could not fetch movie from backend API, using local fallback:', err);
        const fallback = allFallbackMovies.find((m) => m.id === id) || HERO_MOVIE;
        setMovie(fallback);
      } finally {
        setLoading(false);
      }
    };
    loadMovie();
  }, [id]);

  // When Book Now is clicked on movie details page, scroll smoothly to showtimes selector
  const handleBookClick = () => {
    const el = document.getElementById('showtimes-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/seat-selection', {
        state: {
          movie,
          showDate: new Date().toISOString().split('T')[0],
          showTime: '07:30 PM',
          format: movie.formats?.[0] || 'Standard 2D',
        }
      });
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => navigate('/movies')}
        onSearchClick={() => navigate('/movies')}
      />

      {/* Main Page Details */}
      <main className="flex-1 w-full">
        {loading && !movie ? (
          <div className="p-32 flex flex-col items-center justify-center gap-4 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-white">Loading movie screening details...</p>
          </div>
        ) : (
          <MovieDetails
            movie={movie}
            onBookClick={handleBookClick}
            onTrailerClick={setTrailerUrl}
            onSelectShowtime={handleBookClick}
          />
        )}
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Trailer Modal */}
      {trailerUrl && (
        <TrailerModal
          trailerUrl={trailerUrl}
          movieTitle={movie?.title}
          onClose={() => setTrailerUrl(null)}
        />
      )}
    </div>
  );
}