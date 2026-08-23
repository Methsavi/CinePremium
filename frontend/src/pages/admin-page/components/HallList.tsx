import { useState, useEffect } from "react";
import { getHalls, deleteHall } from "../../../services/hallApi";
import { CinemaHall } from "../../../types/hall";
import { useNotification } from "../../../context/NotificationContext";
import { 
  Tv, Trash2, Search, RefreshCw, CheckCircle2, AlertCircle, 
  Armchair, Edit3, LayoutGrid, List, Sparkles, Layers
} from "lucide-react";
import HallEditForm from "./HallEditForm";

interface HallListProps {
  onRefreshTrigger?: number;
}

const SCREEN_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "IMAX 3D":      { bg: "bg-blue-500/15",   border: "border-blue-500/30",   text: "text-blue-300" },
  "4DX":          { bg: "bg-orange-500/15", border: "border-orange-500/30", text: "text-orange-300" },
  "Dolby Cinema": { bg: "bg-purple-500/15", border: "border-purple-500/30", text: "text-purple-300" },
  "Standard 2D":  { bg: "bg-slate-500/15",  border: "border-slate-500/30",  text: "text-slate-300" },
  "ScreenX":      { bg: "bg-teal-500/15",   border: "border-teal-500/30",   text: "text-teal-300" },
};

export function HallList({ onRefreshTrigger }: HallListProps) {
  const { addNotification } = useNotification();
  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [screenFilter, setScreenFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingHall, setEditingHall] = useState<CinemaHall | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const fetchHallsList = async () => {
    try {
      setLoading(true);
      const data = await getHalls();
      setHalls(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cinema halls from database");
      setHalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHallsList();
  }, [onRefreshTrigger]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete cinema hall "${name}"?`)) return;

    try {
      setDeletingId(id);
      await deleteHall(id);
      setHalls((prev) => prev.filter((h) => h.id !== id));
      setActionSuccess(`Cinema hall "${name}" deleted successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);

      addNotification({
        type: 'delete',
        title: 'Cinema Hall Deleted 🗑️',
        message: `Auditorium hall "${name}" was permanently removed.`,
        actionUrl: '/admin',
        actionLabel: 'Check Halls'
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete cinema hall");
      addNotification({
        type: 'error',
        title: 'Hall Deletion Failed',
        message: err instanceof Error ? err.message : "Failed to delete cinema hall."
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredHalls = halls.filter((hall) => {
    const matchesSearch =
      hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hall.screenType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScreen =
      screenFilter === "all" || hall.screenType === screenFilter;

    return matchesSearch && matchesScreen;
  });

  return (
    <div className="space-y-6">
      {/* ── Search, Filter & View Controls ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151b2d] p-4 rounded-2xl border border-[#2e3447] shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#908fa0]" />
            <input
              type="text"
              placeholder="Search halls by name, auditorium..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-xs sm:text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors"
            />
          </div>

          {/* Screen Format Filter */}
          <select
            value={screenFilter}
            onChange={(e) => setScreenFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors cursor-pointer"
          >
            <option value="all">All Screen Formats ({halls.length})</option>
            <option value="IMAX 3D">IMAX 3D</option>
            <option value="Dolby Cinema">Dolby Cinema</option>
            <option value="4DX">4DX Experience</option>
            <option value="ScreenX">ScreenX 270°</option>
            <option value="Standard 2D">Standard 2D</option>
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
            onClick={fetchHallsList}
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
          <span className="text-sm font-semibold text-white">Loading cinema halls database...</span>
        </div>
      ) : filteredHalls.length === 0 ? (
        <div className="p-16 bg-[#151b2d] rounded-2xl border border-[#2e3447] text-center text-[#908fa0] flex flex-col items-center gap-3 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-[#0c1324] border border-[#2e3447] flex items-center justify-center text-primary">
            <Tv className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-white">No Cinema Halls Found</p>
            <p className="text-xs text-[#908fa0]">Create a new auditorium hall configuration to get started.</p>
          </div>
        </div>
      ) : viewMode === "list" ? (
        /* ── Modern Structured List / Table View ── */
        <div className="bg-[#151b2d] border border-[#2e3447] rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2e3447] bg-[#0c1324]/80 text-[#908fa0] uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Cinema Auditorium</th>
                  <th className="py-3.5 px-4">Screen Format</th>
                  <th className="py-3.5 px-4">Total Seating Capacity</th>
                  <th className="py-3.5 px-4">Configured Seating Tiers</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e3447]">
                {filteredHalls.map((hall) => {
                  const screenColors =
                    SCREEN_TYPE_COLORS[hall.screenType] ?? SCREEN_TYPE_COLORS["Standard 2D"];

                  return (
                    <tr
                      key={hall.id}
                      className="hover:bg-[#192036] transition-colors group"
                    >
                      {/* Hall Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0c1324] border border-[#2e3447] flex items-center justify-center text-primary shrink-0 shadow-sm">
                            <Tv className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{hall.name}</h4>
                            <span className="text-[10px] text-[#908fa0] font-mono block">
                              ID: {hall.id.slice(-8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Screen Format Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${screenColors.bg} ${screenColors.border} ${screenColors.text}`}
                        >
                          {hall.screenType}
                        </span>
                      </td>

                      {/* Total Capacity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <Armchair className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-black text-white">{hall.totalCapacity || 0}</span>
                            <span className="text-[10px] text-[#908fa0] block">Reserved Seats</span>
                          </div>
                        </div>
                      </td>

                      {/* Tier Breakdown Chips */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-sm">
                          {hall.seatTiers && hall.seatTiers.length > 0 ? (
                            hall.seatTiers.map((tier, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0c1324] border border-[#2e3447] text-[11px] text-[#dce1fb]"
                              >
                                <span className="font-medium">{tier.tierName}:</span>
                                <strong className="text-primary font-bold">{tier.seatCount} seats</strong>
                              </span>
                            ))
                          ) : (
                            <span className="text-[#908fa0] italic text-xs">Standard general admission</span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingHall(hall)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(hall.id, hall.name)}
                            disabled={deletingId === hall.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{deletingId === hall.id ? "..." : "Delete"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Card Grid View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHalls.map((hall) => {
            const screenColors =
              SCREEN_TYPE_COLORS[hall.screenType] ?? SCREEN_TYPE_COLORS["Standard 2D"];

            return (
              <div
                key={hall.id}
                className="bg-[#151b2d] border border-[#2e3447] rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-primary/40 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{hall.name}</h3>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${screenColors.bg} ${screenColors.border} ${screenColors.text}`}
                    >
                      {hall.screenType}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#0c1324] border border-[#2e3447] flex items-center justify-center text-primary shrink-0 shadow-inner">
                    <Tv className="w-5 h-5" />
                  </div>
                </div>

                {/* Capacity Card */}
                <div className="p-3.5 bg-[#0c1324] rounded-xl border border-[#2e3447] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#908fa0]">
                    <Armchair className="w-4 h-4 text-primary" />
                    <span>Total Auditorium Capacity</span>
                  </div>
                  <span className="text-base font-black text-white">{hall.totalCapacity} Seats</span>
                </div>

                {/* Tiers List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider block">
                    Seat Tiers & Layout ({hall.seatTiers?.length || 0})
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {hall.seatTiers && hall.seatTiers.map((tier, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#0c1324] border border-[#2e3447] text-xs"
                      >
                        <span className="font-medium text-[#dce1fb]">{tier.tierName}</span>
                        <span className="font-bold text-primary">{tier.seatCount} seats</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-[#2e3447] flex items-center justify-between">
                  <span className="text-[11px] text-[#908fa0] font-mono">
                    ID: {hall.id.slice(-6)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingHall(hall)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(hall.id, hall.name)}
                      disabled={deletingId === hall.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingId === hall.id ? "..." : "Delete"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Hall Modal */}
      {editingHall && (
        <HallEditForm
          hall={editingHall}
          onSuccess={() => {
            setEditingHall(null);
            fetchHallsList();
            setActionSuccess("Cinema hall updated successfully.");
            setTimeout(() => setActionSuccess(null), 4000);
          }}
          onCancel={() => setEditingHall(null)}
        />
      )}
    </div>
  );
}

export default HallList;
