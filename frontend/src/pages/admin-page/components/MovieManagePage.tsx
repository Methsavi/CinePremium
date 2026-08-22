import { useState } from "react";
import MovieList from "./MovieList";
import MoviesAddForm from "./MoviesAddForm";
import { PlusCircle } from "lucide-react";

function MovieManagePage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMovieCreated = () => {
    setShowAddForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#151b2d] border border-[#2e3447] rounded-xl">
        <div>
          <h3 className="text-lg font-bold text-[#dce1fb]">Movie Catalog</h3>
          <p className="text-xs text-[#908fa0]">
            Manage current titles, add new releases with R2 poster uploads, and remove movies.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c0c1ff] hover:bg-white text-[#1000a9] font-bold text-sm rounded-lg transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Movie
        </button>
      </div>

      {/* Add Movie Modal */}
      {showAddForm && (
        <MoviesAddForm
          onSuccess={handleMovieCreated}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Movie List Grid */}
      <MovieList onRefreshTrigger={refreshTrigger} />
    </div>
  );
}

export default MovieManagePage;
