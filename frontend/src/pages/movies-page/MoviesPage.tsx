import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovies } from '../../services/movieApi';
import { Movie } from '../../types/movie';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { QuickMovieInfoModal } from '../../components/QuickMovieInfoModal';
import { TrailerModal } from '../../components/TrailerModal';
import {
  Film,
  Search,
  Star,
  Clock,
  Play,
  Ticket,
} from 'lucide-react';

export function MoviesPage() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [quickInfoMovie, setQuickInfoMovie] = useState<Movie | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState<string>('');

  // Fetch movies from database API
  const fetchMoviesData = async () => {
    try {
      setLoading(true);
      const data = await getMovies();
      setMovies(data || []);
    } catch (err) {
      console.error('Failed to fetch movies from database API:', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesData();
  }, []);

  // Filter movies by search query
  const filteredAndSortedMovies = useMemo(() => {
    let result = [...movies];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.tagline?.toLowerCase().includes(q) ||
          m.synopsis.toLowerCase().includes(q) ||
          (Array.isArray(m.genres) && m.genres.some((g) => g.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [movies, searchQuery]);

  const handleBookClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased selection:bg-primary selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => {
          if (movies[0]) handleBookClick(movies[0]);
          else navigate('/');
        }}
        onSearchClick={() => {
          const el = document.getElementById('movies-search-input');
          el?.focus();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* ── Page Header with Search on Right ── */}
        <div className="pt-2 sm:pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display tracking-tight">
              Explore All <span className="text-primary">Movies</span>
            </h1>
          </div>

          {/* Search Bar on the Right */}
          <div className="relative w-full md:w-80 lg:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="movies-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full bg-[#0d0d10] border border-white/15 text-white placeholder:text-zinc-500 text-sm rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-red-500 transition-all shadow-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Movies Display Section ── */}
        {loading ? (
          <div className="p-20 text-center text-zinc-400 flex flex-col items-center justify-center gap-4 bg-[#0d0d10] rounded-3xl border border-white/10">
            <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin shadow-lg" />
            <p className="text-sm font-semibold text-white">Fetching cinema database records...</p>
          </div>
        ) : filteredAndSortedMovies.length === 0 ? (
          <div className="p-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3 bg-[#0d0d10] rounded-3xl border border-white/10">
            <Film className="w-12 h-12 text-zinc-600" />
            <h3 className="text-lg font-bold text-white">No Movies Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              No movies matched your search query "{searchQuery}".
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-red-700 transition-all"
            >
              Clear Search
            </button>
          </div>
        ) : (
          /* ── Movies Grid View ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedMovies.map((movie) => (
              <div
                key={movie.id}
                className="group relative bg-[#0d0d10] border border-white/10 hover:border-red-600/60 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_35px_rgba(229,9,20,0.25)] transition-all duration-300 flex flex-col justify-between"
              >
                {/* Poster Header */}
                <div
                  onClick={() => setQuickInfoMovie(movie)}
                  className="relative h-72 sm:h-80 w-full overflow-hidden bg-black cursor-pointer"
                >
                  <img
                    src={movie.posterUrl || movie.backdropUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-transparent to-black/40 opacity-70 group-hover:opacity-90 transition-opacity" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                      {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  {movie.rating && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-amber-300 text-xs font-bold border border-white/10 shadow-lg">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{movie.rating}</span>
                    </div>
                  )}

                  {/* Duration & Age Rating */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    {movie.duration && (
                      <span className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px] text-zinc-300">
                        <Clock className="w-3 h-3 text-red-500" />
                        {movie.duration}
                      </span>
                    )}
                    {movie.ageRating && (
                      <span className="px-2 py-0.5 rounded bg-black/70 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {movie.ageRating}
                      </span>
                    )}
                  </div>
                </div>

                {/* Movie Details with Fade Shadow */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-gradient-to-b from-[#0d0d10] via-black to-[#0d0d10] border-t border-white/5">
                  <div>
                    <h3
                      onClick={() => setQuickInfoMovie(movie)}
                      className="text-base font-black text-white group-hover:text-red-500 transition-colors line-clamp-1 cursor-pointer uppercase tracking-tight"
                    >
                      {movie.title}
                    </h3>
                    {movie.tagline && (
                      <p className="text-xs text-zinc-400 italic line-clamp-1 mt-0.5">
                        "{movie.tagline}"
                      </p>
                    )}
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {movie.synopsis}
                    </p>
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.slice(0, 3).map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-white/10 rounded-md text-[10px] font-semibold"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
                    {movie.trailerUrl && (
                      <button
                        onClick={() => {
                          setTrailerTitle(movie.title);
                          setTrailerUrl(movie.trailerUrl || null);
                        }}
                        className="flex items-center justify-center gap-1 py-2 px-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current text-red-500" />
                        <span>Trailer</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleBookClick(movie)}
                      className={`flex items-center justify-center gap-1 py-2 px-2 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md ${
                        movie.trailerUrl ? 'col-span-1' : 'col-span-2'
                      } bg-red-600 hover:bg-red-700 text-white shadow-red-600/30`}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{movie.status === 'now_showing' ? 'Book Now' : 'Notify Me'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default MoviesPage;
