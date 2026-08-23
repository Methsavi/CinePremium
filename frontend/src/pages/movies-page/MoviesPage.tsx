import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovies } from '../../services/movieApi';
import { NOW_PLAYING_MOVIES, HERO_MOVIE } from '../../data/movies';
import { Movie } from '../../types/movie';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { QuickMovieInfoModal } from '../../components/QuickMovieInfoModal';
import { TrailerModal } from '../../components/TrailerModal';
import { useAuth } from '../../context/AuthContext';
import {
  Film,
  Search,
  Star,
  Clock,
  Play,
  Ticket,
  SlidersHorizontal,
  RefreshCw,
  LayoutGrid,
  List,
} from 'lucide-react';

export function MoviesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'now_showing' | 'coming_soon'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'title' | 'latest'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Modals state
  const [quickInfoMovie, setQuickInfoMovie] = useState<Movie | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState<string>('');

  // Fetch movies from database API
  const fetchMoviesData = async () => {
    try {
      setLoading(true);
      const data = await getMovies();
      if (data && data.length > 0) {
        setMovies(data);
      } else {
        // Fallback to sample movies if database is empty
        setMovies(NOW_PLAYING_MOVIES);
      }
    } catch (err) {
      console.warn('Could not fetch from database API, using fallback data:', err);
      setMovies(NOW_PLAYING_MOVIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesData();
  }, []);

  // Compute unique genres from all fetched movies
  const allGenres = useMemo(() => {
    const genresSet = new Set<string>();
    movies.forEach((m) => {
      if (Array.isArray(m.genres)) {
        m.genres.forEach((g) => genresSet.add(g));
      }
    });
    return ['All', ...Array.from(genresSet)];
  }, [movies]);

  // Filter & sort
  const filteredAndSortedMovies = useMemo(() => {
    let result = [...movies];

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.tagline?.toLowerCase().includes(q) ||
          m.synopsis.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    if (selectedGenre !== 'All') {
      result = result.filter((m) => m.genres && m.genres.includes(selectedGenre));
    }

    if (selectedStatus !== 'all') {
      result = result.filter((m) => m.status === selectedStatus);
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'latest') {
      result.sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''));
    }

    return result;
  }, [movies, searchQuery, selectedGenre, selectedStatus, sortBy]);

  const handleBookClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans antialiased selection:bg-primary selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onBookNowClick={() => handleBookClick(movies[0] || HERO_MOVIE)}
        onSearchClick={() => {
          const el = document.getElementById('movies-search-input');
          el?.focus();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto w-full space-y-8">
        
        {/* ── Page Header / Hero Banner ── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0c1324] via-[#151b2d] to-[#0c1324] border border-white/10 p-6 sm:p-10 shadow-2xl">
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(229,9,20,0.15)]">
              <Film className="w-3.5 h-3.5" />
              <span>Cinema Repertoire Database</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-tight">
              Explore All <span className="text-primary">Movies</span>
            </h1>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Discover Hollywood blockbusters, critically acclaimed indie releases, and revolutionary IMAX 3D experiences. Real-time showtime booking available for all screenings.
            </p>
          </div>
        </div>

        {/* ── Search, Filters & Controls Bar ── */}
        <div className="bg-surface-container/80 border border-outline-variant/60 rounded-2xl p-4 md:p-5 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                id="movies-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies by title, tagline, genres..."
                className="w-full bg-[#0c1324] border border-[#2e3447] text-white placeholder-on-surface-variant text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-[#0c1324] border border-[#2e3447] p-1 rounded-xl">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                All ({movies.length})
              </button>
              <button
                onClick={() => setSelectedStatus('now_showing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === 'now_showing'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Now Showing
              </button>
              <button
                onClick={() => setSelectedStatus('coming_soon')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === 'coming_soon'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Coming Soon
              </button>
            </div>

            {/* Sort & View Mode Controls */}
            <div className="flex items-center gap-2 sm:gap-3 justify-between lg:justify-end">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-on-surface-variant hidden sm:inline" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#0c1324] border border-[#2e3447] text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                >
                  <option value="rating">Top Rated</option>
                  <option value="title">Title (A - Z)</option>
                  <option value="latest">Release Date</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-[#0c1324] border border-[#2e3447] rounded-xl p-1 gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  title="Compact List View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'compact' ? 'bg-white/15 text-white' : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchMoviesData}
                title="Refresh Movies from Database"
                className="p-2 bg-[#0c1324] hover:bg-[#151b2d] border border-[#2e3447] rounded-xl text-on-surface-variant hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
              </button>
            </div>
          </div>

          {/* Genre Capsules */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {allGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-white/20 text-white border border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.15)]'
                    : 'bg-[#0c1324] text-on-surface-variant hover:text-white border border-[#2e3447]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* ── Movies Display Section ── */}
        {loading ? (
          <div className="p-20 text-center text-on-surface-variant flex flex-col items-center justify-center gap-4 bg-surface-container/30 rounded-3xl border border-outline-variant/40">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin shadow-lg" />
            <p className="text-sm font-semibold text-white">Fetching cinema database records...</p>
          </div>
        ) : filteredAndSortedMovies.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3 bg-surface-container/30 rounded-3xl border border-outline-variant/40">
            <Film className="w-12 h-12 text-on-surface-variant opacity-40" />
            <h3 className="text-lg font-bold text-white">No Movies Matched Your Filter</h3>
            <p className="text-xs text-on-surface-variant max-w-sm">
              Try adjusting your search terms, clearing genre filters, or switching statuses.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('All');
                setSelectedStatus('all');
              }}
              className="mt-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-primary/90 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Grid View ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedMovies.map((movie) => (
              <div
                key={movie.id}
                className="group relative bg-[#151b2d] border border-[#2e3447] hover:border-primary/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Poster Header */}
                <div
                  onClick={() => setQuickInfoMovie(movie)}
                  className="relative h-72 sm:h-80 w-full overflow-hidden bg-[#0c1324] cursor-pointer"
                >
                  <img
                    src={movie.posterUrl || movie.backdropUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151b2d] via-transparent to-black/40 opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        movie.status === 'now_showing'
                          ? 'bg-emerald-500/90 text-white shadow-md'
                          : 'bg-amber-500/90 text-white shadow-md'
                      }`}
                    >
                      {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  {movie.rating && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-amber-300 text-xs font-bold border border-white/10 shadow-lg">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{movie.rating}</span>
                    </div>
                  )}

                  {/* Duration & Age Rating */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    {movie.duration && (
                      <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px] text-[#c7c4d7]">
                        <Clock className="w-3 h-3 text-[#908fa0]" />
                        {movie.duration}
                      </span>
                    )}
                    {movie.ageRating && (
                      <span className="px-2 py-0.5 rounded bg-black/60 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {movie.ageRating}
                      </span>
                    )}
                  </div>
                </div>

                {/* Movie Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      onClick={() => setQuickInfoMovie(movie)}
                      className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                    >
                      {movie.title}
                    </h3>
                    {movie.tagline && (
                      <p className="text-xs text-[#c0c1ff] italic line-clamp-1 mt-0.5">
                        "{movie.tagline}"
                      </p>
                    )}
                    <p className="text-xs text-[#908fa0] line-clamp-2 mt-1.5">
                      {movie.synopsis}
                    </p>
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {movie.genres.slice(0, 3).map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#0c1324] text-[#c7c4d7] border border-[#2e3447] rounded-md text-[10px] font-medium"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-[#2e3447] grid grid-cols-2 gap-2">
                    {movie.trailerUrl && (
                      <button
                        onClick={() => {
                          setTrailerTitle(movie.title);
                          setTrailerUrl(movie.trailerUrl || null);
                        }}
                        className="flex items-center justify-center gap-1 py-2 px-2 text-xs font-semibold text-white bg-[#0c1324] hover:bg-[#191f31] border border-[#2e3447] rounded-xl transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current text-primary" />
                        <span>Trailer</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleBookClick(movie)}
                      className={`flex items-center justify-center gap-1 py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md ${
                        movie.trailerUrl ? 'col-span-1' : 'col-span-2'
                      } ${
                        movie.status === 'now_showing'
                          ? 'bg-primary hover:bg-primary/90 text-white'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{movie.status === 'now_showing' ? 'Book Now' : 'Notify Me'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Compact List View ── */
          <div className="space-y-3">
            {filteredAndSortedMovies.map((movie) => (
              <div
                key={movie.id}
                className="bg-[#151b2d] border border-[#2e3447] hover:border-primary/40 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div
                  onClick={() => setQuickInfoMovie(movie)}
                  className="flex items-start gap-4 cursor-pointer flex-1 min-w-0"
                >
                  <img
                    src={movie.posterUrl || movie.backdropUrl}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-xl border border-white/10 shrink-0"
                    loading="lazy"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          movie.status === 'now_showing'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {movie.status === 'now_showing' ? 'Live' : 'Upcoming'}
                      </span>
                      {movie.rating && (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-300">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {movie.rating}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-base truncate hover:text-primary transition-colors">
                      {movie.title}
                    </h4>

                    {movie.tagline && (
                      <p className="text-xs text-[#c0c1ff] italic truncate">"{movie.tagline}"</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant pt-0.5">
                      {movie.duration && <span>{movie.duration}</span>}
                      {movie.genres && (
                        <span>· {movie.genres.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2e3447]">
                  {movie.trailerUrl && (
                    <button
                      onClick={() => {
                        setTrailerTitle(movie.title);
                        setTrailerUrl(movie.trailerUrl || null);
                      }}
                      className="p-2 bg-[#0c1324] hover:bg-[#191f31] border border-[#2e3447] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-primary" />
                      <span className="hidden sm:inline">Trailer</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleBookClick(movie)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-all ${
                      movie.status === 'now_showing'
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-amber-600 hover:bg-amber-500'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>{movie.status === 'now_showing' ? 'Book Tickets' : 'Remind Me'}</span>
                  </button>
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
