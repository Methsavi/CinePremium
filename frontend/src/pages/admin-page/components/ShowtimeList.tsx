import { useState, useEffect } from "react";
import { getShowtimes, deleteShowtime } from "../../../services/showtimeApi";
import { Showtime } from "../../../types/showtime";
import { useNotification } from "../../../context/NotificationContext";
import {
  Calendar,
  Clock,
  Trash2,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Film,
  Tv,
  Banknote,
  LayoutGrid,
  List,
  Edit3,
} from "lucide-react";
import ShowtimeEditForm from "./ShowtimeEditForm";

interface ShowtimeListProps {
  onRefreshTrigger?: number;
}

const SCREEN_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "IMAX 3D":      { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-300" },
  "4DX":          { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-300" },
  "Dolby Cinema": { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-300" },
  "Standard 2D":  { bg: "bg-slate-500/10",  border: "border-slate-500/30",  text: "text-slate-300" },
  "ScreenX":      { bg: "bg-teal-500/10",   border: "border-teal-500/30",   text: "text-teal-300" },
};

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (d.getTime() === today.getTime()) return "Today";
    if (d.getTime() === tomorrow.getTime()) return "Tomorrow";

    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "schedule">("schedule");

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
    if (!window.confirm("Are you sure you want to cancel this scheduled showtime?")) return;
    try {
      const stToDelete = showtimes.find((s) => s.id === id);
      const title = stToDelete?.movie?.title || "Screening";
      const time = stToDelete?.showTime || "";
      const date = stToDelete?.showDate || "";

      setDeletingId(id);
      await deleteShowtime(id);
      setShowtimes((prev) => prev.filter((s) => s.id !== id));
      setActionSuccess("Showtime cancelled successfully.");
      setTimeout(() => setActionSuccess(null), 4000);

      addNotification({
        type: 'delete',
        title: 'Showtime Cancelled 🗑️',
        message: `Showtime for "${title}" (${time}, ${date}) was removed from the projection schedule.`,
        actionUrl: '/admin',
        actionLabel: 'View Schedule'
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete showtime");
      addNotification({
        type: 'error',
        title: 'Cancellation Failed',
        message: err instanceof Error ? err.message : "Failed to cancel showtime."
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredShowtimes = showtimes.filter((st) => {
    const movieTitle = st.movie?.title || "";
    const hallName   = st.hall?.name   || "";
    const format     = st.format       || "";
    return (
      movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hallName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      format.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Group by date for schedule view
  const grouped = filteredShowtimes.reduce<Record<string, Showtime[]>>((acc, st) => {
    const key = st.showDate;
    if (!acc[key]) acc[key] = [];
    acc[key].push(st);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {/* Search, View Toggle & Refresh Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151b2d] p-4 rounded-xl border border-[#2e3447]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#908fa0]" />
          <input
            type="text"
            placeholder="Search by movie, hall, format..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#c0c1ff]"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0c1324] border border-[#2e3447] rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode("schedule")}
              title="Schedule View"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "schedule" ? "bg-[#c0c1ff]/15 text-[#c0c1ff]" : "text-[#908fa0] hover:text-[#dce1fb]"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Card Grid View"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "grid" ? "bg-[#c0c1ff]/15 text-[#c0c1ff]" : "text-[#908fa0] hover:text-[#dce1fb]"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchShowtimesList}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#191f31] hover:bg-[#2e3447] text-[#dce1fb] border border-[#2e3447] rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
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

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-[#908fa0] flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#c0c1ff]" />
          <span>Loading scheduled showtimes...</span>
        </div>
      ) : filteredShowtimes.length === 0 ? (
        <div className="p-12 bg-[#151b2d] rounded-xl border border-[#2e3447] text-center text-[#908fa0] flex flex-col items-center gap-2">
          <Calendar className="w-10 h-10 text-[#464554]" />
          <p className="text-base font-medium">No showtimes scheduled yet</p>
          <p className="text-xs text-[#908fa0]">Click "Schedule Movie & Ticket Prices" to create one.</p>
        </div>
      ) : viewMode === "schedule" ? (
        /* ── Schedule / Timeline View ── */
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#c0c1ff]/10 border border-[#c0c1ff]/20 text-[#c0c1ff] text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateLabel(date)}
                  <span className="ml-1 opacity-60 font-normal">({date})</span>
                </div>
                <div className="flex-1 border-t border-[#2e3447]" />
                <span className="text-xs text-[#908fa0]">{grouped[date].length} show{grouped[date].length !== 1 ? "s" : ""}</span>
              </div>

              {/* Showtimes for that date — sorted by time */}
              <div className="space-y-2">
                {grouped[date]
                  .slice()
                  .sort((a, b) => a.showTime.localeCompare(b.showTime))
                  .map((st) => {
                    const colors =
                      SCREEN_TYPE_COLORS[st.hall?.screenType ?? ""] ??
                      SCREEN_TYPE_COLORS["Standard 2D"];
                    const formatColors =
                      SCREEN_TYPE_COLORS[st.format ?? ""] ??
                      SCREEN_TYPE_COLORS["Standard 2D"];

                    return (
                      <div
                        key={st.id}
                        className="flex items-center gap-4 p-4 bg-[#151b2d] border border-[#2e3447] rounded-xl hover:border-[#464554] transition-all group"
                      >
                        {/* Time Badge */}
                        <div className="flex-shrink-0 w-20 text-center">
                          <div className="text-base font-black text-amber-300 leading-none">
                            {st.showTime.split(" ")[0]}
                          </div>
                          <div className="text-[10px] text-amber-500 font-semibold">
                            {st.showTime.split(" ")[1]}
                          </div>
                        </div>

                        {/* Vertical divider */}
                        <div className="w-px self-stretch bg-[#2e3447] flex-shrink-0" />

                        {/* Movie Poster */}
                        {st.movie?.posterUrl ? (
                          <img
                            src={st.movie.posterUrl}
                            alt={st.movie?.title}
                            className="w-10 h-14 object-cover rounded-lg border border-[#2e3447] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-[#0c1324] rounded-lg border border-[#2e3447] flex items-center justify-center text-[#464554] flex-shrink-0">
                            <Film className="w-4 h-4" />
                          </div>
                        )}

                        {/* Movie & Hall Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-[#dce1fb] truncate">
                              {st.movie?.title || "Unknown Movie"}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${formatColors.bg} ${formatColors.border} ${formatColors.text}`}>
                              {st.format || "Standard 2D"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#908fa0]">
                            <Tv className="w-3 h-3 text-[#c0c1ff]" />
                            <span className="font-medium text-[#c0c1ff]">{st.hall?.name || "—"}</span>
                            {st.hall?.screenType && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded border ${colors.bg} ${colors.border} ${colors.text} font-semibold`}>
                                {st.hall.screenType}
                              </span>
                            )}
                            {st.hall?.totalCapacity && (
                              <span className="text-[#908fa0]">· {st.hall.totalCapacity} seats</span>
                            )}
                          </div>
                        </div>

                        {/* Tier Prices */}
                        {st.tierPrices && st.tierPrices.length > 0 && (
                          <div className="hidden sm:flex flex-wrap gap-1.5 max-w-[160px]">
                            {st.tierPrices.map((tp, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-[#0c1324] border border-[#2e3447] text-[10px] text-[#c7c4d7] flex items-center gap-1"
                              >
                                {tp.tierName}:{" "}
                                <strong className="text-emerald-400">Rs. {tp.price.toFixed(2)}</strong>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex-shrink-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingShowtime(st)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(st.id)}
                            disabled={deletingId === st.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {deletingId === st.id ? "..." : "Remove"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Card Grid View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShowtimes.map((st) => {
            const formatColors =
              SCREEN_TYPE_COLORS[st.format ?? ""] ?? SCREEN_TYPE_COLORS["Standard 2D"];
            const hallColors =
              SCREEN_TYPE_COLORS[st.hall?.screenType ?? ""] ?? SCREEN_TYPE_COLORS["Standard 2D"];

            return (
              <div
                key={st.id}
                className="bg-[#151b2d] border border-[#2e3447] rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-[#464554] transition-all space-y-4"
              >
                {/* Top: Poster & Info */}
                <div className="flex items-start gap-3">
                  {st.movie?.posterUrl ? (
                    <img
                      src={st.movie.posterUrl}
                      alt={st.movie?.title}
                      className="w-14 h-20 object-cover rounded-lg border border-[#2e3447]"
                    />
                  ) : (
                    <div className="w-14 h-20 bg-[#0c1324] rounded-lg border border-[#2e3447] flex items-center justify-center text-[#464554]">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${formatColors.bg} ${formatColors.border} ${formatColors.text}`}>
                      {st.format || "Standard 2D"}
                    </span>
                    <h4 className="text-base font-bold text-[#dce1fb] truncate mt-1">
                      {st.movie?.title || "Unknown Movie"}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-[#908fa0]">
                      <Tv className="w-3 h-3 text-[#c0c1ff]" />
                      <span className="truncate font-medium">{st.hall?.name || "—"}</span>
                    </div>
                    {st.hall?.screenType && (
                      <span className={`inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded border ${hallColors.bg} ${hallColors.border} ${hallColors.text}`}>
                        {st.hall.screenType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center justify-between p-3 bg-[#0c1324] rounded-lg border border-[#2e3447] text-xs">
                  <div className="flex items-center gap-1.5 text-[#dce1fb]">
                    <Calendar className="w-3.5 h-3.5 text-[#c0c1ff]" />
                    <span>{formatDateLabel(st.showDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-black text-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{st.showTime}</span>
                  </div>
                </div>

                {/* Tier Prices */}
                {st.tierPrices?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#908fa0] uppercase">
                      <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                      Tier Prices
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {st.tierPrices.map((tp, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-[#0c1324] border border-[#2e3447] text-[11px] text-[#c7c4d7] flex items-center gap-1"
                        >
                          <span>{tp.tierName}:</span>
                          <strong className="text-emerald-400">Rs. {tp.price.toFixed(2)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-3 border-t border-[#2e3447] flex items-center justify-between">
                  <span className="text-[11px] text-[#908fa0]">ID: {st.id.slice(-6)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingShowtime(st)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-md transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(st.id)}
                      disabled={deletingId === st.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === st.id ? "Cancelling..." : "Cancel Showing"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Showtime Modal */}
      {editingShowtime && (
        <ShowtimeEditForm
          showtime={editingShowtime}
          onSuccess={() => {
            setEditingShowtime(null);
            fetchShowtimesList();
            setActionSuccess("Showtime updated successfully.");
            setTimeout(() => setActionSuccess(null), 4000);
          }}
          onCancel={() => setEditingShowtime(null)}
        />
      )}
    </div>
  );
}

export default ShowtimeList;
