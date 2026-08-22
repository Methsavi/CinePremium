import { useState, useEffect } from "react";
import { getHalls, deleteHall } from "../../../services/hallApi";
import { CinemaHall } from "../../../types/hall";
import { Tv, Trash2, Search, RefreshCw, CheckCircle2, AlertCircle, Armchair } from "lucide-react";

interface HallListProps {
  onRefreshTrigger?: number;
}

function HallList({ onRefreshTrigger }: HallListProps) {
  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchHallsList = async () => {
    try {
      setLoading(true);
      const data = await getHalls();
      setHalls(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cinema halls");
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
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete cinema hall");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredHalls = halls.filter(
    (hall) =>
      hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hall.screenType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151b2d] p-4 rounded-xl border border-[#2e3447]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#908fa0]" />
          <input
            type="text"
            placeholder="Search halls by name, screen format..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#c0c1ff]"
          />
        </div>

        <button
          onClick={fetchHallsList}
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

      {/* Halls Grid */}
      {loading ? (
        <div className="p-12 text-center text-[#908fa0] flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#c0c1ff]" />
          <span>Loading cinema halls...</span>
        </div>
      ) : filteredHalls.length === 0 ? (
        <div className="p-12 bg-[#151b2d] rounded-xl border border-[#2e3447] text-center text-[#908fa0] flex flex-col items-center gap-2">
          <Tv className="w-10 h-10 text-[#464554]" />
          <p className="text-base font-medium">No cinema halls found</p>
          <p className="text-xs text-[#908fa0]">Try creating a new cinema hall.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHalls.map((hall) => (
            <div
              key={hall.id}
              className="bg-[#151b2d] border border-[#2e3447] rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-[#464554] transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold text-[#dce1fb]">{hall.name}</h4>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c0c1ff]/10 text-[#c0c1ff] border border-[#c0c1ff]/30">
                    {hall.screenType}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-black text-white">
                    {hall.totalCapacity}
                  </span>
                  <span className="text-[10px] text-[#908fa0] font-medium uppercase">
                    Total Seats
                  </span>
                </div>
              </div>

              {/* Seat Tiers List */}
              <div className="space-y-2 pt-2 border-t border-[#2e3447]">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#908fa0] uppercase">
                  <Armchair className="w-3.5 h-3.5 text-[#c0c1ff]" />
                  Seat Capacities by Tier
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {hall.seatTiers && hall.seatTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#0c1324] border border-[#2e3447] text-xs"
                    >
                      <span className="font-medium text-[#dce1fb]">{tier.tierName}</span>
                      <span className="font-bold text-[#c0c1ff]">{tier.seatCount} seats</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#2e3447] flex items-center justify-between">
                <span className="text-[11px] text-[#908fa0]">
                  ID: {hall.id.slice(-6)}
                </span>
                <button
                  onClick={() => handleDelete(hall.id, hall.name)}
                  disabled={deletingId === hall.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deletingId === hall.id ? "Deleting..." : "Delete Hall"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HallList;
