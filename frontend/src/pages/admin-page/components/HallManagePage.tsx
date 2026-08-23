import { useState } from "react";
import HallList from "./HallList";
import HallAddForm from "./HallAddForm";
import { Plus } from "lucide-react";

function HallManagePage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleHallCreated = () => {
    setShowAddForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Cinema Halls</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure theater auditoriums, screen formats, and customize seat tier capacities
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-red-500/50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-red-500" />
          <span>Add Hall</span>
        </button>
      </div>

      {/* Add Hall Modal */}
      {showAddForm && (
        <HallAddForm
          onSuccess={handleHallCreated}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Hall List */}
      <HallList onRefreshTrigger={refreshTrigger} />
    </div>
  );
}

export default HallManagePage;
