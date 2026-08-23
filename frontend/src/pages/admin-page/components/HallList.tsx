import { useState, useEffect } from "react";
import { getHalls, deleteHall } from "../../../services/hallApi";
import { CinemaHall } from "../../../types/hall";
import { useNotification } from "../../../context/NotificationContext";
import { 
  Tv, Trash2, Search, RefreshCw, AlertCircle, 
  Edit2, LayoutGrid, List, Eye, X, Layers
} from "lucide-react";
import HallEditForm from "./HallEditForm";

interface HallListProps {
  onRefreshTrigger?: number;
}

export function HallList({ onRefreshTrigger }: HallListProps) {
  const { addNotification } = useNotification();
  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [screenFilter, setScreenFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingHall, setEditingHall] = useState<CinemaHall | null>(null);
  const [viewingHall, setViewingHall] = useState<CinemaHall | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const fetchHallsList = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHalls();
      setHalls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load halls");
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
                placeholder="Search halls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border border-white/15 text-white placeholder:text-zinc-500 text-xs sm:text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Screen Format Filter */}
            <select
              value={screenFilter}
              onChange={(e) => setScreenFilter(e.target.value)}
              className="w-full sm:w-auto bg-zinc-950 border border-white/10 text-white text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
            >
              <option value="all">All Screen Formats ({halls.length})</option>
              <option value="IMAX 3D">IMAX 3D</option>
              <option value="Dolby Cinema">Dolby Cinema</option>
              <option value="4DX">4DX Experience</option>
              <option value="ScreenX">ScreenX 270°</option>
              <option value="Standard 2D">Standard 2D</option>
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
              onClick={fetchHallsList}
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
            <span className="text-xs">Loading cinema halls database...</span>
          </div>
        ) : filteredHalls.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-2">
            <Tv className="w-10 h-10 text-zinc-700" />
            <p className="text-sm font-semibold text-zinc-300">No Cinema Halls Found</p>
            <p className="text-xs text-zinc-500">Create a new auditorium hall configuration to get started.</p>
          </div>
        ) : viewMode === "list" ? (
          /* ── Minimalist Table View (Minimum Details) ── */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-t border-b border-white/10 text-xs font-semibold text-zinc-400">
                  <th className="px-6 py-3.5">Auditorium</th>
                  <th className="px-6 py-3.5">Format</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Capacity</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredHalls.map((hall) => (
                  <tr
                    key={hall.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Hall Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 text-red-500 font-bold flex items-center justify-center border border-white/10 text-sm shadow-md">
                          <Tv className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{hall.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* Format */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-300 font-medium">
                      {hall.screenType}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-emerald-400">
                        Active
                      </span>
                    </td>

                    {/* Capacity */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-300">
                      <span className="font-medium">{hall.totalCapacity || 0} Seats</span>
                    </td>

                    {/* Actions (View Details, Edit, Delete) */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingHall(hall)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingHall(hall)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Edit Hall"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(hall.id, hall.name)}
                          disabled={deletingId === hall.id}
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Hall"
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
            {filteredHalls.map((hall) => (
              <div
                key={hall.id}
                className="bg-black/60 border border-white/10 rounded-xl p-5 shadow-md flex flex-col justify-between hover:border-red-600/50 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">{hall.name}</h3>
                    <span className="text-xs font-semibold text-zinc-400">
                      {hall.screenType}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-red-500 shrink-0">
                    <Tv className="w-4 h-4" />
                  </div>
                </div>

                {/* Capacity */}
                <div className="p-3 bg-zinc-900/60 rounded-lg border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Total Seating</span>
                  <span className="text-sm font-bold text-white">{hall.totalCapacity} Seats</span>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-end">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingHall(hall)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="View Full Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingHall(hall)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Edit Hall"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(hall.id, hall.name)}
                      disabled={deletingId === hall.id}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete Hall"
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
      {viewingHall && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setViewingHall(null)}
        >
          <div 
            className="relative w-full max-w-xl bg-[#0b0b0e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 bg-zinc-950/80 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">{viewingHall.name}</h3>
                  <p className="text-[11px] text-zinc-400">Auditorium Configuration & Capacity Breakdown</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingHall(null)}
                className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* Screen Format & Total Capacity Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Screen Format</span>
                  <span className="text-sm font-bold text-white">{viewingHall.screenType}</span>
                </div>

                <div className="p-4 bg-zinc-950 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Total Capacity</span>
                  <span className="text-sm font-black text-emerald-400">{viewingHall.totalCapacity} Seats</span>
                </div>
              </div>

              {/* Seating Tiers Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Seat Tiers & Distribution
                  </span>
                </div>

                <div className="space-y-2">
                  {viewingHall.seatTiers && viewingHall.seatTiers.length > 0 ? (
                    viewingHall.seatTiers.map((tier, idx) => {
                      const percent = viewingHall.totalCapacity 
                        ? Math.round((tier.seatCount / viewingHall.totalCapacity) * 100) 
                        : 0;

                      return (
                        <div key={idx} className="p-3.5 bg-zinc-950 rounded-xl border border-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs sm:text-sm">{tier.tierName}</span>
                            <span className="text-xs text-red-400 font-bold font-mono">
                              {tier.seatCount} seats ({percent}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-600 rounded-full" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 text-zinc-400 italic">
                      Standard seating configuration (no tiered categories).
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-950 border-t border-white/10 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingHall(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hall Modal */}
      {editingHall && (
        <HallEditForm
          hall={editingHall}
          onSuccess={() => {
            setEditingHall(null);
            fetchHallsList();
          }}
          onCancel={() => setEditingHall(null)}
        />
      )}
    </div>
  );
}

export default HallList;
