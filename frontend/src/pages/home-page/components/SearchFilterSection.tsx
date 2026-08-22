import React from 'react';
import { Search } from 'lucide-react';

interface SearchFilterSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
}

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy'];

export const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreChange
}) => {
  return (
    <section className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-xl border border-outline-variant shadow-lg shadow-black/20">
      <div className="relative w-full md:w-96">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search movies, cinemas..."
          className="w-full bg-background border border-outline-variant rounded-full py-3 pl-12 pr-4 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-2 md:pb-0">
        {GENRES.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => onGenreChange(genre)}
              className={`whitespace-nowrap cursor-pointer px-4 py-2 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-variant text-on-surface-variant hover:text-on-surface border border-outline-variant hover:border-outline'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </section>
  );
};
