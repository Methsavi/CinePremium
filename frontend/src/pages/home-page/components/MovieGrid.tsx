import React from 'react';
import { Movie } from '@/types/movie';
import { MovieCard } from './MovieCard';
import { Film, RefreshCw } from 'lucide-react';

interface MovieGridProps {
  movies: Movie[];
  title: string;
  onBookClick: (movie: Movie) => void;
  onTrailerClick: (trailerUrl: string) => void;
  onResetFilters: () => void;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  title,
  onBookClick,
  onTrailerClick,
  onResetFilters
}) => {
  if (movies.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <Film className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">No Movies Found</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          We couldn't find any movies matching your current search or filter criteria. Try adjusting your selections.
        </p>
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-colors shadow-lg shadow-red-600/30"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Filters</span>
        </button>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-7 rounded-full bg-gradient-to-b from-red-500 to-amber-500" />
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {title}
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
            {movies.length} {movies.length === 1 ? 'Movie' : 'Movies'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onBookClick={onBookClick}
            onTrailerClick={onTrailerClick}
          />
        ))}
      </div>
    </section>
  );
};
