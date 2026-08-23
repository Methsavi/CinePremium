import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovies } from '../../services/movieApi';
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
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0d0d10] via-zinc-950 to-[#0d0d10] border border-white/10 p-6 sm:p-10 shadow-2xl">
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-0" />
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
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="movies-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies by title, tagline, genres..."
                className="w-full bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-500 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-red-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-950 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All ({movies.length})
              </button>
              <button
                onClick={() => setSelectedStatus('now_showing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === 'now_showing'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Now Showing
              </button>
              <button
                onClick={() => setSelectedStatus('coming_soon')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === 'coming_soon'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Coming Soon
              </button>
            </div>

            {/* Sort & View Mode Controls */}
            <div className="flex items-center gap-2 sm:gap-3 justify-between lg:justify-end">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 hidden sm:inline" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-zinc-950 border border-white/10 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="rating">Top Rated</option>
                  <option value="title">Title (A - Z)</option>
                  <option value="latest">Release Date</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-zinc-950 border border-white/10 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  title="Compact List View"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'compact' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchMoviesData}
                title="Refresh Movies from Database"
                className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Genre Capsules */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {allGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-red-600 text-white border border-red-500 shadow-[0_0_12px_rgba(229,9,20,0.4)]'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {genre}
              </button>
            ))}
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
            <h3 className="text-lg font-bold text-white">No Movies Matched Your Filter</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Try adjusting your search terms, clearing genre filters, or switching statuses.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('All');
                setSelectedStatus('all');
              }}
              className="mt-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-red-700 transition-all"
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
        ) : (
          /* ── Compact List View ── */
          <div className="space-y-3">
            {filteredAndSortedMovies.map((movie) => (
              <div
                key={movie.id}
                className="bg-[#0d0d10] border border-white/10 hover:border-red-600/50 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
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
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white">
                        {movie.status === 'now_showing' ? 'Live' : 'Upcoming'}
                      </span>
                      {movie.rating && (
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-300">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {movie.rating}
                        </span>
                      )}
                    </div>

                    <h4 className="font-black text-white text-base truncate hover:text-red-500 transition-colors uppercase tracking-tight">
                      {movie.title}
                    </h4>

                    {movie.tagline && (
                      <p className="text-xs text-zinc-400 italic truncate">"{movie.tagline}"</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-0.5">
                      {movie.duration && <span>{movie.duration}</span>}
                      {movie.genres && (
                        <span>· {movie.genres.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                  {movie.trailerUrl && (
                    <button
                      onClick={() => {
                        setTrailerTitle(movie.title);
                        setTrailerUrl(movie.trailerUrl || null);
                      }}
                      className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-red-500" />
                      <span className="hidden sm:inline">Trailer</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleBookClick(movie)}
                    className="px-4 py-2 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
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
