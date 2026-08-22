import React from 'react';
import { FormatType } from '@/types/movie';
import { SlidersHorizontal, Flame, Calendar, Sparkles } from 'lucide-react';

interface QuickFilterBarProps {
  selectedStatus: 'all' | 'now_showing' | 'coming_soon';
  onStatusChange: (status: 'all' | 'now_showing' | 'coming_soon') => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  selectedFormat: string;
  onFormatChange: (format: string) => void;
}

const GENRES_LIST = ['All Genres', 'Sci-Fi', 'Action', 'Fantasy', 'Thriller', 'Drama', 'Horror'];
const FORMAT_OPTIONS: FormatType[] = ['IMAX 3D', '4DX', 'Dolby Cinema', '2D', 'ScreenX'];

export const QuickFilterBar: React.FC<QuickFilterBarProps> = ({
  selectedStatus,
  onStatusChange,
  selectedGenre,
  onGenreChange,
  selectedFormat,
  onFormatChange
}) => {
  return (
    <div id="movies" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 shadow-lg">
          <button
            onClick={() => onStatusChange('now_showing')}
            className={`flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              selectedStatus === 'now_showing'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Now Showing</span>
          </button>

          <button
            onClick={() => onStatusChange('coming_soon')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              selectedStatus === 'coming_soon'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Coming Soon</span>
          </button>

          <button
            onClick={() => onStatusChange('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
              selectedStatus === 'all'
                ? 'bg-white/15 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>All Movies</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Format:
          </span>
          <button
            onClick={() => onFormatChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedFormat === 'all'
                ? 'bg-red-500/20 border border-red-500 text-red-400'
                : 'bg-slate-900 border border-white/10 text-slate-300 hover:border-white/20'
            }`}
          >
            All
          </button>
          {FORMAT_OPTIONS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => onFormatChange(selectedFormat === fmt ? 'all' : fmt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedFormat === fmt
                  ? 'bg-red-500 border border-red-400 text-white shadow-md shadow-red-500/30'
                  : 'bg-slate-900 border border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {GENRES_LIST.map((genre: string) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedGenre === genre
                ? 'bg-slate-100 text-slate-950 font-bold shadow-lg shadow-white/10 transform scale-105'
                : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};
