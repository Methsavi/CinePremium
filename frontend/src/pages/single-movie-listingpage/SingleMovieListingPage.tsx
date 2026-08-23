import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HERO_MOVIE } from '@/data/movies';
import { getMovieById } from '@/services/movieApi';
import { Movie } from '@/types/movie';
import { Navbar } from '@/components/Navbar';
import MovieDetails from './components/MovieDetails';
import { TrailerModal } from '@/components/TrailerModal';
import { Footer } from '@/components/Footer';
import { RefreshCw, Film, ArrowLeft } from 'lucide-react';

export default function SingleMovieListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(id === HERO_MOVIE.id ? HERO_MOVIE : null);
  const [loading, setLoading] = useState<boolean>(true);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;
      if (id === HERO_MOVIE.id) {
        setMovie(HERO_MOVIE);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedMovie = await getMovieById(id);
        if (fetchedMovie) {
          setMovie(fetchedMovie);
        } else {
          const allDb = await getMovies();
          const found = allDb.find((m) => m.id === id || (m as any)._id === id);
          setMovie(found || null);
        }
      } catch (err) {
        console.error('Could not fetch movie from backend API:', err);
        setMovie(null);
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
    } else if (movie) {
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
            <p className="text-sm font-semibold text-white">Loading movie screening details from database...</p>
          </div>
        ) : !movie ? (
          <div className="p-24 flex flex-col items-center justify-center gap-5 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center text-primary shadow-xl">
              <Film className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                The requested movie does not exist in the database or may have been removed.
              </p>
            </div>
            <button
              onClick={() => navigate('/movies')}
              className="liquid-glow-btn text-surface-container-lowest font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Movies</span>
            </button>
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