import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HERO_MOVIE } from '@/data/movies';
import { getMovies } from '@/services/movieApi';
import { Movie } from '@/types/movie';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SearchFilterSection } from './components/SearchFilterSection';
import { NowPlayingSection } from './components/NowPlayingSection';
import { ComingSoonSection } from './components/ComingSoonSection';
import { QuickMovieInfoModal } from '@/components/QuickMovieInfoModal';
import { TrailerModal } from '@/components/TrailerModal';
import { Footer } from '@/components/Footer';
import { useNotification } from '@/context/NotificationContext';
import { RefreshCw } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  // Database Movies State
  const [dbMovies, setDbMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // Modals & Notifications
  const [quickInfoMovie, setQuickInfoMovie] = useState<Movie | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState<string>('');

  // Fetch movies directly from the database API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = await getMovies();
        setDbMovies(data || []);
      } catch (err) {
        console.error('Failed to fetch movies from database API:', err);
        setDbMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Split movies by database status
  const nowPlayingDbMovies = useMemo(() => {
    return dbMovies.filter((movie) => movie.status === 'now_showing');
  }, [dbMovies]);

  const comingSoonDbMovies = useMemo(() => {
    return dbMovies.filter((movie) => movie.status === 'coming_soon');
  }, [dbMovies]);

  // Filtered now playing movies according to search query and selected genre
  const filteredNowPlaying = useMemo(() => {
    return nowPlayingDbMovies.filter((movie: Movie) => {
      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = movie.title?.toLowerCase().includes(q);
        const matchesTagline = movie.tagline?.toLowerCase().includes(q);
        const matchesGenre = movie.genres && movie.genres.some((g: string) => g.toLowerCase().includes(q));
        if (!matchesTitle && !matchesTagline && !matchesGenre) return false;
      }

      // Genre filter
      if (selectedGenre !== 'All') {
        if (!movie.genres || !movie.genres.includes(selectedGenre)) {
          return false;
        }
      }

      return true;
    });
  }, [nowPlayingDbMovies, searchQuery, selectedGenre]);

  const { addNotification } = useNotification();

  const handleRemindMe = () => {
    addNotification({ message: 'Reminder Set', type: 'info' });
  };

  // Navigate to the dedicated movie detail page with auditorium showtimes & halls
  const handleBookClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => navigate('/movies')}
        onSearchClick={() => {
          const el = document.getElementById('search-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section (Preserved Mock Data as Requested) */}
        <HeroSection
          onBookClick={() => handleBookClick(HERO_MOVIE)}
          onTrailerClick={(url) => {
            setTrailerTitle(HERO_MOVIE.title);
            setTrailerUrl(url);
          }}
        />

        {/* Database Movies Content Container */}
        <div id="search-section" className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-12 pb-12">
          {/* Search & Genre Filters */}
          <SearchFilterSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedGenre={selectedGenre}
            onGenreChange={setSelectedGenre}
          />

          {/* Now Playing Section (Database records only) */}
          {loading ? (
            <div className="p-16 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3 bg-surface rounded-2xl border border-outline-variant/40">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-semibold text-white">Loading now playing movies from database...</p>
            </div>
          ) : (
            <NowPlayingSection
              movies={filteredNowPlaying}
              onBookMovie={handleBookClick}
              onMovieClick={(movie) => setQuickInfoMovie(movie)}
              onViewAllClick={() => navigate('/movies')}
            />
          )}

          {/* Coming Soon Section (Database records only) */}
          {!loading && comingSoonDbMovies.length > 0 && (
            <ComingSoonSection
              movies={comingSoonDbMovies}
              onRemindMe={handleRemindMe}
              onMovieClick={(movie) => setQuickInfoMovie(movie)}
            />
          )}
        </div>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Quick Movie Info Popup Modal */}
      {quickInfoMovie && (
        <QuickMovieInfoModal
          movie={quickInfoMovie}
          onClose={() => setQuickInfoMovie(null)}
          onWatchTrailer={(url) => {
            setTrailerTitle(quickInfoMovie.title);
            setQuickInfoMovie(null);
            setTrailerUrl(url);
          }}
        />
      )}

      {/* Trailer Modal */}
      {trailerUrl && (
        <TrailerModal
          trailerUrl={trailerUrl}
          movieTitle={trailerTitle}
          onClose={() => setTrailerUrl(null)}
        />
      )}
    </div>
  );
}

export default HomePage;
