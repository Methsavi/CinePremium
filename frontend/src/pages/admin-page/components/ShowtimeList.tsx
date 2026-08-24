import { useState, useEffect } from "react";
import { getShowtimes, deleteShowtime } from "../../../services/showtimeApi";
import { Showtime } from "../../../types/showtime";
import { useNotification } from "../../../context/NotificationContext";
import {
  Calendar,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  Film,
  Tv,
  LayoutGrid,
  List,
  Edit2,
  Eye,
  X,
  Banknote
} from "lucide-react";
import ShowtimeEditForm from "./ShowtimeEditForm";

interface ShowtimeListProps {
  onRefreshTrigger?: number;
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (d.getTime() === today.getTime()) return "Today";
    if (d.getTime() === tomorrow.getTime()) return "Tomorrow";

    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function ShowtimeList({ onRefreshTrigger }: ShowtimeListProps) {
  const { addNotification } = useNotification();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [viewingShowtime, setViewingShowtime] = useState<Showtime | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const fetchShowtimesList = async () => {
    try {
      setLoading(true);
      const data = await getShowtimes();
      setShowtimes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch showtimes");
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimesList();
  }, [onRefreshTrigger]);

  const handleDelete = async (id: string) => {
    const stToDelete = showtimes.find(s => s.id === id);
    const title = stToDelete?.movie?.title || "Movie";

    if (!window.confirm(`Are you sure you want to cancel the showtime for "${title}"?`)) return;

    try {
      setDeletingId(id);
      await deleteShowtime(id);
      setShowtimes((prev) => prev.filter((s) => s.id !== id));

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

  const filteredShowtimes = showtimes
    .filter((st) => {
      const movieTitle = st.movie?.title || "";
      const hallName   = st.hall?.name   || "";
      const format     = st.format       || "";
      return (
        movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hallName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        format.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      // Show newly added / latest created showtimes at the top
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      return (b.id || "").localeCompare(a.id || "");
    });

  return (
    <div className="space-y-6">
      {/* ── Table Card Container ── */}
      <div className="bg-[#0d0d10] border border-white/10 rounded-xl overflow-hidden shadow-md">
        {/* Card Header Toolbar */}
        <div className="p-5 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search showtimes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-white/15 text-white placeholder:text-zinc-500 text-xs sm:text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center bg-zinc-950 border border-white/10 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "table"
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
              onClick={fetchShowtimesList}
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

        {/* Content */}
        {loading ? (
          <div className="p-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
            <span className="text-xs">Loading scheduled showtimes...</span>
          </div>
        ) : filteredShowtimes.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-2">
            <Calendar className="w-10 h-10 text-zinc-700" />
            <p className="text-sm font-semibold text-zinc-300">No showtimes scheduled yet</p>
            <p className="text-xs text-zinc-500">Click "Schedule Showtime" to create one.</p>
          </div>
        ) : viewMode === "table" ? (
          /* ── Minimalist Table View (Minimum Details) ── */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-t border-b border-white/10 text-xs font-semibold text-zinc-400">
                  <th className="px-6 py-3.5">Movie</th>
                  <th className="px-6 py-3.5">Auditorium</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Screen Date & Time</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredShowtimes.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Movie Info + Poster */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        {st.movie?.posterUrl ? (
                          <img
                            src={st.movie.posterUrl}
                            alt={st.movie?.title}
                            className="w-9 h-12 object-cover rounded-md border border-white/10 shrink-0 shadow-sm"
                          />
                        ) : (
                          <div className="w-9 h-12 bg-zinc-900 rounded-md border border-white/10 flex items-center justify-center text-zinc-500 shrink-0">
                            <Film className="w-4 h-4" />
                          </div>
                        )}
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-semibold text-white text-sm truncate uppercase tracking-tight">
                            {st.movie?.title || "Untitled"}
                          </h4>
                        </div>
                      </div>
                    </td>

                    {/* Hall & Format */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white">{st.hall?.name || "Main Hall"}</div>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          {st.format || "Standard 2D"}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-emerald-400">
                        Active
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400">
                      <div className="font-bold text-white">{st.showTime}</div>
                      <span className="text-[11px] text-zinc-400">{formatDateLabel(st.showDate)}</span>
                    </td>

                    {/* Actions (View Details, Edit, Cancel) */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingShowtime(st)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingShowtime(st)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Edit Showtime"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(st.id)}
                          disabled={deletingId === st.id}
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                          title="Cancel Showtime"
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
            {filteredShowtimes.map((st) => (
              <div
                key={st.id}
                className="bg-black/60 border border-white/10 rounded-xl p-5 shadow-md flex flex-col justify-between hover:border-red-600/50 transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-tight truncate max-w-[200px]">
                      {st.movie?.title || "Movie"}
                    </h3>
                    <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-red-500" />
                      <span>{st.hall?.name || "Hall"}</span>
                      <span>• {st.format || "2D"}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">
                    {st.showTime}
                  </span>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-lg border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Date</span>
                  <span className="font-semibold text-white">{st.showDate}</span>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingShowtime(st)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingShowtime(st)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Edit Showtime"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(st.id)}
                      disabled={deletingId === st.id}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Cancel Showtime"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── View Full Details Modal ── */}
      {viewingShowtime && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setViewingShowtime(null)}
        >
          <div 
            className="relative w-full max-w-xl bg-[#0b0b0e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 bg-zinc-950/80 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">Showtime Details</h3>
                  <p className="text-[11px] text-zinc-400">Projection slot & ticket pricing scheme</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingShowtime(null)}
                className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* Movie Info Box */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 flex items-center gap-4">
                {viewingShowtime.movie?.posterUrl && (
                  <img 
                    src={viewingShowtime.movie.posterUrl} 
                    alt={viewingShowtime.movie.title}
                    className="w-14 h-20 object-cover rounded-lg border border-white/10 shrink-0" 
                  />
                )}
                <div className="space-y-1 min-w-0">
                  <h4 className="text-base font-bold text-white uppercase tracking-tight truncate">
                    {viewingShowtime.movie?.title || "Untitled Movie"}
                  </h4>
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <span className="text-red-400 font-semibold">{viewingShowtime.movie?.duration || "2h 15m"}</span>
                    <span>•</span>
                    <span>{viewingShowtime.movie?.genres?.join("\\") || "Feature"}</span>
                  </div>
                </div>
              </div>

              {/* Auditorium & Screening Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Auditorium & Format</span>
                  <div className="font-bold text-white">{viewingShowtime.hall?.name || "Main Hall"}</div>
                  <span className="text-xs text-zinc-400 font-medium">
                    {viewingShowtime.format || "Standard 2D"}
                  </span>
                </div>

                <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Date & Time Slot</span>
                  <div className="font-black text-amber-400 text-sm">
                    {viewingShowtime.showTime}
                  </div>
                  <span className="text-xs text-zinc-300 block">{formatDateLabel(viewingShowtime.showDate)} ({viewingShowtime.showDate})</span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Tier Ticket Pricing
                  </span>
                </div>

                <div className="space-y-2">
                  {viewingShowtime.tierPrices && viewingShowtime.tierPrices.length > 0 ? (
                    viewingShowtime.tierPrices.map((tp, idx) => (
                      <div key={idx} className="p-3 bg-zinc-950 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="font-semibold text-white text-xs sm:text-sm">
                          {tp.tierName}
                        </span>
                        <div className="font-mono text-sm font-bold text-emerald-400">
                          Rs. {Number(tp.price).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 text-zinc-400 italic">
                      Standard admission pricing applied.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-950 border-t border-white/10 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingShowtime(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Showtime Modal */}
      {editingShowtime && (
        <ShowtimeEditForm
          showtime={editingShowtime}
          onSuccess={() => {
            setEditingShowtime(null);
            fetchShowtimesList();
          }}
          onCancel={() => setEditingShowtime(null)}
        />
      )}
    </div>
  );
}

export default ShowtimeList;
