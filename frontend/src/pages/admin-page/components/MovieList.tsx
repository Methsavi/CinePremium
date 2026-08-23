import { useState, useEffect } from "react";
import { getMovies, deleteMovie } from "../../../services/movieApi";
import { Movie } from "../../../types/movie";
import { useNotification } from "../../../context/NotificationContext";
import { 
  Film, Trash2, Search, AlertCircle, 
  RefreshCw, Edit2, LayoutGrid, List, Eye, X, Play
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
  const [viewingMovie, setViewingMovie] = useState<Movie | null>(null);
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

      addNotification({
        type: 'delete',
        message: 'Deleted Successfully'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'Action Failed'
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
      {/* ── Table Card Container ── */}
      <div className="bg-[#0d0d10] border border-white/10 rounded-xl overflow-hidden shadow-md">
        {/* Card Header Toolbar */}
        <div className="p-5 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border border-white/15 text-white placeholder:text-zinc-500 text-xs sm:text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-zinc-950 border border-white/10 text-white text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
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

          {/* Right Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center bg-zinc-950 border border-white/10 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={fetchMoviesList}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-zinc-950 hover:bg-zinc-900 text-white border border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-500" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading / Empty / Content */}
        {loading ? (
          <div className="p-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
            <span className="text-xs">Loading live movie records from database...</span>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-2">
            <Film className="w-10 h-10 text-zinc-700" />
            <p className="text-sm font-semibold text-zinc-300">No Movies Found</p>
            <p className="text-xs text-zinc-500">Try creating a new movie or adjusting your search filters.</p>
          </div>
        ) : viewMode === "list" ? (
          /* ── Minimalist Table View (Minimum Details) ── */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-t border-b border-white/10 text-xs font-semibold text-zinc-400">
                  <th className="px-6 py-3.5">Movie</th>
                  <th className="px-6 py-3.5">Genre</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMovies.map((movie) => (
                  <tr
                    key={movie.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Poster + Title */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <img
                          src={movie.posterUrl || movie.backdropUrl}
                          alt={movie.title}
                          className="w-9 h-12 object-cover rounded-md border border-white/10 shrink-0 shadow-sm"
                          onError={(e) => {
                            if (movie.backdropUrl && e.currentTarget.src !== movie.backdropUrl) {
                              e.currentTarget.src = movie.backdropUrl;
                            }
                          }}
                        />
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-semibold text-white text-sm truncate uppercase tracking-tight">{movie.title}</h4>
                        </div>
                      </div>
                    </td>

                    {/* Genre */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-zinc-300 font-medium">
                        {movie.genres && movie.genres.length > 0 ? movie.genres.join("\\") : "Feature"}
                      </span>
                    </td>

                    {/* Status: Green text for Now Showing, Yellow text for Upcoming, NO background */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {movie.status === "now_showing" ? (
                        <span className="text-xs font-semibold text-emerald-400">
                          Now Showing
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-yellow-400">
                          Upcoming
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400">
                      <span>{movie.duration || "2h 15m"}</span>
                    </td>

                    {/* Action buttons (View Details, Edit, Delete) */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingMovie(movie)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingMovie(movie)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Edit Movie"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(movie.id, movie.title)}
                          disabled={deletingId === movie.id}
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Movie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── Grid View ── */
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="bg-black/60 border border-white/10 rounded-xl overflow-hidden shadow-md flex flex-col hover:border-red-600/50 transition-all"
              >
                {/* Poster Header */}
                <div className="relative h-44 w-full bg-black overflow-hidden">
                  <img
                    src={movie.posterUrl || movie.backdropUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-transparent to-black/40" />

                  <span className={`absolute top-3 right-3 text-xs font-bold drop-shadow-md ${
                    movie.status === "now_showing" ? "text-emerald-400" : "text-yellow-400"
                  }`}>
                    {movie.status === "now_showing" ? "Now Showing" : "Upcoming"}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#0d0d10]">
                  <div>
                    <h4 className="text-base font-bold text-white uppercase tracking-tight line-clamp-1">{movie.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{movie.duration || "2h 15m"} · {movie.genres?.join("\\")}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-end">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewingMovie(movie)}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingMovie(movie)}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit Movie"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id, movie.title)}
                        disabled={deletingId === movie.id}
                        className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Movie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── View Full Details Modal ── */}
      {viewingMovie && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setViewingMovie(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-[#0b0b0e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Backdrop */}
            <div className="relative h-48 bg-zinc-950 overflow-hidden shrink-0 border-b border-white/10">
              {viewingMovie.backdropUrl || viewingMovie.posterUrl ? (
                <img 
                  src={viewingMovie.backdropUrl || viewingMovie.posterUrl} 
                  alt={viewingMovie.title}
                  className="w-full h-full object-cover opacity-50"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-transparent to-black/60" />

              <button
                onClick={() => setViewingMovie(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl bg-black/60 hover:bg-black transition-all cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4">
                {viewingMovie.posterUrl && (
                  <img 
                    src={viewingMovie.posterUrl} 
                    alt={viewingMovie.title} 
                    className="w-16 h-24 object-cover rounded-lg border-2 border-white/20 shadow-xl shrink-0"
                  />
                )}
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight truncate">
                    {viewingMovie.title}
                  </h3>
                  {viewingMovie.tagline && (
                    <p className="text-xs text-zinc-300 italic truncate">"{viewingMovie.tagline}"</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Body Details */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* Metadata Info */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <span className={`text-xs font-bold ${
                  viewingMovie.status === "now_showing" ? "text-emerald-400" : "text-yellow-400"
                }`}>
                  {viewingMovie.status === "now_showing" ? "Now Showing" : "Upcoming"}
                </span>

                {viewingMovie.rating && (
                  <span className="text-xs font-bold text-amber-400">
                    {viewingMovie.rating} / 10
                  </span>
                )}

                {viewingMovie.duration && (
                  <span className="text-xs text-zinc-300 font-medium">
                    {viewingMovie.duration}
                  </span>
                )}

                {viewingMovie.releaseDate && (
                  <span className="text-xs text-zinc-400">
                    {viewingMovie.releaseDate}
                  </span>
                )}
              </div>

              {/* Genres (No background, joined with \) */}
              {viewingMovie.genres && viewingMovie.genres.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Genres
                  </span>
                  <span className="text-xs text-zinc-300 font-medium">
                    {viewingMovie.genres.join("\\")}
                  </span>
                </div>
              )}

              {/* Synopsis */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Synopsis / Overview
                </span>
                <p className="text-zinc-300 leading-relaxed bg-zinc-950 p-4 rounded-xl border border-white/5">
                  {viewingMovie.synopsis || "No synopsis available for this title."}
                </p>
              </div>

              {/* Watch Trailer Button */}
              {viewingMovie.trailerUrl && (
                <div className="pt-1">
                  <a 
                    href={viewingMovie.trailerUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md hover:shadow-red-600/30 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Trailer</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-950 border-t border-white/10 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingMovie(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Movie Modal */}
      {editingMovie && (
        <MoviesEditForm
          movie={editingMovie}
          onSuccess={() => {
            setEditingMovie(null);
            fetchMoviesList();
          }}
          onCancel={() => setEditingMovie(null)}
        />
      )}
    </div>
  );
}

export default MovieList;
