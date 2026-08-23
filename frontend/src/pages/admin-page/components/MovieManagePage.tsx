import { useState } from "react";
import MovieList from "./MovieList";
import MoviesAddForm from "./MoviesAddForm";
import { Plus } from "lucide-react";

function MovieManagePage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMovieCreated = () => {
    setShowAddForm(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Movie Catalog</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage movie titles, synopsis, screening status, and media posters
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-red-500/50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-red-500" />
          <span>Add Movie</span>
        </button>
      </div>

      {/* Add Movie Modal */}
      {showAddForm && (
        <MoviesAddForm
          onSuccess={handleMovieCreated}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Movie List */}
      <MovieList onRefreshTrigger={refreshTrigger} />
    </div>
  );
}

export default MovieManagePage;
