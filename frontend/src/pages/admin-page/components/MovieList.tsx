import { useState, useEffect } from "react";
import { getMovies, deleteMovie } from "../../../services/movieApi";
import { Movie } from "../../../types/movie";
import { Film, Trash2, Search, Star, Clock, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

interface MovieListProps {
  onRefreshTrigger?: number;
}

function MovieList({ onRefreshTrigger }: MovieListProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchMoviesList = async () => {
    try {
      setLoading(true);
      const data = await getMovies();
      setMovies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch movies");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesList();
  }, [onRefreshTrigger]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete movie "${title}"?`)) return;

    try {
      setDeletingId(id);
      await deleteMovie(id);
      setMovies((prev) => prev.filter((m) => m.id !== id));
      setActionSuccess(`Movie "${title}" deleted successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete movie");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (movie.genres && movie.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesStatus =
      statusFilter === "all" || movie.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151b2d] p-4 rounded-xl border border-[#2e3447]">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#908fa0]" />
            <input
              type="text"
              placeholder="Search movies by title, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#c0c1ff]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#c0c1ff]"
          >
            <option value="all">All Statuses</option>
            <option value="now_showing">Now Showing</option>
            <option value="coming_soon">Coming Soon</option>
          </select>
        </div>

        <button
          onClick={fetchMoviesList}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-[#191f31] hover:bg-[#2e3447] text-[#dce1fb] border border-[#2e3447] rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh List
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionSuccess}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Movies Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#908fa0] flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#c0c1ff]" />
          <span>Loading movies database...</span>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="p-12 bg-[#151b2d] rounded-xl border border-[#2e3447] text-center text-[#908fa0] flex flex-col items-center gap-2">
          <Film className="w-10 h-10 text-[#464554]" />
          <p className="text-base font-medium">No movies found</p>
          <p className="text-xs text-[#908fa0]">Try creating a new movie or changing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-[#151b2d] border border-[#2e3447] rounded-xl overflow-hidden shadow-lg flex flex-col hover:border-[#464554] transition-all"
            >
              {/* Poster / Backdrop Header */}
              <div className="relative h-44 w-full bg-[#0c1324] overflow-hidden">
                {movie.posterUrl || movie.backdropUrl ? (
                  <img
                    src={movie.posterUrl || movie.backdropUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#464554]">
                    <Film className="w-12 h-12" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#151b2d] via-transparent to-black/40" />

                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    movie.status === "now_showing"
                      ? "bg-emerald-500/90 text-white"
                      : "bg-amber-500/90 text-white"
                  }`}
                >
                  {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
                </span>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-[#dce1fb]">
                  {movie.rating && (
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-amber-300 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {movie.rating}
                    </div>
                  )}
                  {movie.duration && (
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-[#c7c4d7]">
                      <Clock className="w-3.5 h-3.5 text-[#908fa0]" />
                      {movie.duration}
                    </div>
                  )}
                </div>
              </div>

              {/* Movie Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-lg font-bold text-[#dce1fb] line-clamp-1">{movie.title}</h4>
                  {movie.tagline && (
                    <p className="text-xs text-[#c0c1ff] italic mb-1 line-clamp-1">"{movie.tagline}"</p>
                  )}
                  <p className="text-xs text-[#908fa0] line-clamp-2 mt-1">{movie.synopsis}</p>
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {movie.genres.map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#0c1324] text-[#c7c4d7] border border-[#2e3447] rounded-md text-[10px] font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action footer */}
                <div className="pt-3 border-t border-[#2e3447] flex items-center justify-between">
                  <span className="text-[11px] text-[#908fa0]">
                    ID: {movie.id.slice(-6)}
                  </span>
                  <button
                    onClick={() => handleDelete(movie.id, movie.title)}
                    disabled={deletingId === movie.id}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingId === movie.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieList;
