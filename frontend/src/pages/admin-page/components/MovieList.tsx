import { useState, useEffect } from "react";
import { getMovies, deleteMovie } from "../../../services/movieApi";
import { Movie } from "../../../types/movie";
import { useNotification } from "../../../context/NotificationContext";
import { 
  Film, Trash2, Search, Star, Clock, AlertCircle, 
  CheckCircle2, RefreshCw, Edit3, LayoutGrid, List, 
  Calendar, Sparkles
} from "lucide-react";
import MoviesEditForm from "./MoviesEditForm";

interface MovieListProps {
  onRefreshTrigger?: number;
}

export function MovieList({ onRefreshTrigger }: MovieListProps) {
  const { addNotification } = useNotification();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const fetchMoviesList = async () => {
    try {
      setLoading(true);
      const data = await getMovies();
      setMovies(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch movies from database");
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

      addNotification({
        type: 'delete',
        title: 'Movie Deleted 🗑️',
        message: `Movie "${title}" was permanently removed from the catalog.`,
        actionUrl: '/movies',
        actionLabel: 'Check Catalog'
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete movie");
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: err instanceof Error ? err.message : "Failed to delete movie."
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (movie.tagline && movie.tagline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.genres && movie.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesStatus =
      statusFilter === "all" || movie.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ── Search, Filters & View Toggle Bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151b2d] p-4 rounded-2xl border border-[#2e3447] shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#908fa0]" />
            <input
              type="text"
              placeholder="Search movies by title, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors cursor-pointer"
          >
            <option value="all">All Statuses ({movies.length})</option>
            <option value="now_showing">
              Now Showing ({movies.filter((m) => m.status === "now_showing").length})
            </option>
            <option value="coming_soon">
              Coming Soon ({movies.filter((m) => m.status === "coming_soon").length})
            </option>
          </select>
        </div>

        {/* Right: View Mode Toggle & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center bg-[#0c1324] border border-[#2e3447] p-1 rounded-xl">
            <button
              onClick={() => setViewMode("list")}
              title="List View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-primary text-white shadow-sm"
                  : "text-[#908fa0] hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-primary text-white shadow-sm"
                  : "text-[#908fa0] hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchMoviesList}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#0c1324] hover:bg-[#191f31] text-[#dce1fb] border border-[#2e3447] rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="p-16 text-center text-[#908fa0] flex flex-col items-center justify-center gap-3 bg-[#151b2d] rounded-2xl border border-[#2e3447]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm font-semibold text-white">Loading live movie records from database...</span>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="p-16 bg-[#151b2d] rounded-2xl border border-[#2e3447] text-center text-[#908fa0] flex flex-col items-center gap-3 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-[#0c1324] border border-[#2e3447] flex items-center justify-center text-primary">
            <Film className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-white">No Movies Found</p>
            <p className="text-xs text-[#908fa0]">Try creating a new movie or adjusting your search filters.</p>
          </div>
        </div>
      ) : viewMode === "list" ? (
        /* ── Modern Structured List / Table View ── */
        <div className="bg-[#151b2d] border border-[#2e3447] rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2e3447] bg-[#0c1324]/80 text-[#908fa0] uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Movie Details</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Rating & Duration</th>
                  <th className="py-3.5 px-4">Genres</th>
                  <th className="py-3.5 px-4">Release Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e3447]">
                {filteredMovies.map((movie) => (
                  <tr
                    key={movie.id}
                    className="hover:bg-[#192036] transition-colors group"
                  >
                    {/* Poster + Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <img
                          src={movie.posterUrl || movie.backdropUrl}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded-lg border border-[#2e3447] shrink-0 shadow-sm"
                          onError={(e) => {
                            if (movie.backdropUrl && e.currentTarget.src !== movie.backdropUrl) {
                              e.currentTarget.src = movie.backdropUrl;
                            }
                          }}
                        />
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">{movie.title}</h4>
                          {movie.tagline && (
                            <p className="text-[11px] text-[#c0c1ff] italic truncate max-w-xs">
                              "{movie.tagline}"
                            </p>
                          )}
                          <span className="text-[10px] text-[#908fa0] block font-mono">
                            ID: {movie.id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          movie.status === "now_showing"
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          movie.status === "now_showing" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                        }`} />
                        <span>{movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}</span>
                      </span>
                    </td>

                    {/* Rating & Duration */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {movie.rating ? (
                          <div className="flex items-center gap-1 text-amber-300 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{movie.rating}</span>
                          </div>
                        ) : (
                          <span className="text-[#908fa0]">Unrated</span>
                        )}
                        <div className="flex items-center gap-1 text-[#908fa0] text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>{movie.duration || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Genres */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {movie.genres && movie.genres.length > 0 ? (
                          movie.genres.map((g, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#0c1324] border border-[#2e3447] text-[10px] text-[#c7c4d7]"
                            >
                              {g}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#908fa0] italic">—</span>
                        )}
                      </div>
                    </td>

                    {/* Release Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-[#dce1fb]">
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{movie.releaseDate || "Now Active"}</span>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingMovie(movie)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(movie.id, movie.title)}
                          disabled={deletingId === movie.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{deletingId === movie.id ? "..." : "Delete"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Card Grid View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-[#151b2d] border border-[#2e3447] rounded-2xl overflow-hidden shadow-lg flex flex-col hover:border-primary/40 transition-all"
            >
              {/* Poster Header */}
              <div className="relative h-48 w-full bg-[#0c1324] overflow-hidden">
                <img
                  src={movie.posterUrl || movie.backdropUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151b2d] via-transparent to-black/40" />

                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-md ${
                    movie.status === "now_showing"
                      ? "bg-emerald-500/90 text-white border-emerald-400"
                      : "bg-amber-500/90 text-white border-amber-400"
                  }`}
                >
                  {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
                </span>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-[#dce1fb]">
                  {movie.rating ? (
                    <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-amber-300 font-bold border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{movie.rating}</span>
                    </div>
                  ) : null}
                  {movie.duration && (
                    <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[#c7c4d7] border border-white/10">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{movie.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-base font-bold text-white line-clamp-1">{movie.title}</h4>
                  {movie.tagline && (
                    <p className="text-xs text-[#c0c1ff] italic mb-1 line-clamp-1">"{movie.tagline}"</p>
                  )}
                  <p className="text-xs text-[#908fa0] line-clamp-2 mt-1">{movie.synopsis}</p>
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {movie.genres.map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 bg-[#0c1324] text-[#c7c4d7] border border-[#2e3447] rounded-lg text-[10px] font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="pt-3 border-t border-[#2e3447] flex items-center justify-between">
                  <span className="text-[11px] text-[#908fa0] font-mono">
                    ID: {movie.id.slice(-6)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingMovie(movie)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(movie.id, movie.title)}
                      disabled={deletingId === movie.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingId === movie.id ? "..." : "Delete"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Movie Modal */}
      {editingMovie && (
        <MoviesEditForm
          movie={editingMovie}
          onSuccess={() => {
            setEditingMovie(null);
            fetchMoviesList();
            setActionSuccess("Movie updated successfully.");
            setTimeout(() => setActionSuccess(null), 4000);
          }}
          onCancel={() => setEditingMovie(null)}
        />
      )}
    </div>
  );
}

export default MovieList;
