import { useState } from "react";
import ShowtimeList from "./ShowtimeList";
import ShowtimeAddForm from "./ShowtimeAddForm";
import { PlusCircle } from "lucide-react";

function ShowtimeManagePage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleShowtimeCreated = () => {
    setShowAddForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#151b2d] border border-[#2e3447] rounded-xl">
        <div>
          <h3 className="text-lg font-bold text-[#dce1fb]">Movie Forecasting & Showtime Management</h3>
          <p className="text-xs text-[#908fa0]">
            Assign movies to cinema halls, set showtime slots, and configure tier-based ticket pricing for forecasting.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c0c1ff] hover:bg-white text-[#1000a9] font-bold text-sm rounded-lg transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Schedule Movie & Ticket Prices
        </button>
      </div>

      {/* Add Showtime Modal */}
      {showAddForm && (
        <ShowtimeAddForm
          onSuccess={handleShowtimeCreated}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Showtime List Grid */}
      <ShowtimeList onRefreshTrigger={refreshTrigger} />
    </div>
  );
}

export default ShowtimeManagePage;
