import { useState } from "react";
import ShowtimeList from "./ShowtimeList";
import ShowtimeAddForm from "./ShowtimeAddForm";
import { Plus } from "lucide-react";

function ShowtimeManagePage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleShowtimeCreated = () => {
    setShowAddForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Showtime Schedules</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Assign movies to cinema halls, set screening time slots, and configure ticket prices
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-red-500/50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-red-500" />
          <span>Schedule Showtime</span>
        </button>
      </div>

      {/* Add Showtime Modal */}
      {showAddForm && (
        <ShowtimeAddForm
          onSuccess={handleShowtimeCreated}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Showtime List */}
      <ShowtimeList onRefreshTrigger={refreshTrigger} />
    </div>
  );
}

export default ShowtimeManagePage;
