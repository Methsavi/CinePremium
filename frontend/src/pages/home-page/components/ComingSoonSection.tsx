import React from 'react';
import { COMING_SOON_FEATURE, COMING_SOON_STACK } from '@/data/movies';
import { Movie } from '@/types/movie';
import { Bell } from 'lucide-react';

interface ComingSoonSectionProps {
  onRemindMe: (movie: Movie) => void;
}

export const ComingSoonSection: React.FC<ComingSoonSectionProps> = ({ onRemindMe }) => {
  return (
    <section className="mt-12 space-y-6">
      <div className="flex justify-between items-end border-b border-outline-variant pb-4">
        <h3 className="text-2xl sm:text-3xl font-semibold text-on-surface">Coming Soon</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[400px]">
        <div
          onClick={() => onRemindMe(COMING_SOON_FEATURE)}
          className="md:col-span-2 relative rounded-xl border border-outline-variant overflow-hidden group cursor-pointer min-h-[300px]"
        >
          <div
            className="absolute inset-0 bg-cover bg-center w-full h-full opacity-60 group-hover:opacity-80 transition-all duration-500 group-hover:scale-105 transform"
            style={{ backgroundImage: `url('${COMING_SOON_FEATURE.backdropUrl}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <span className="px-2 py-1 bg-surface-variant/80 backdrop-blur text-on-surface-variant rounded text-[10px] uppercase font-bold tracking-wider mb-2 inline-block">
                {COMING_SOON_FEATURE.releaseDate}
              </span>
              <h4 className="text-2xl sm:text-3xl font-bold text-on-surface leading-tight">
                {COMING_SOON_FEATURE.title}
              </h4>
              <p className="text-sm text-on-surface-variant max-w-md hidden md:block mt-1">
                {COMING_SOON_FEATURE.synopsis}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemindMe(COMING_SOON_FEATURE);
              }}
              className="bg-surface/50 backdrop-blur-sm border border-outline-variant text-on-surface font-medium text-sm px-6 py-2 rounded-full hover:bg-surface-variant transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Bell className="w-4 h-4" />
              <span>Remind Me</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 h-full">
          {COMING_SOON_STACK.map((movie) => (
            <div
              key={movie.id}
              onClick={() => onRemindMe(movie)}
              className="flex-1 relative rounded-xl border border-outline-variant overflow-hidden group cursor-pointer bg-surface min-h-[180px]"
            >
              <div className="absolute inset-0 p-4 flex flex-col justify-end z-10">
                <span className="text-primary text-xs font-semibold mb-1">
                  {movie.releaseDate}
                </span>
                <h4 className="text-lg font-bold text-on-surface">
                  {movie.title}
                </h4>
                <p className="text-xs text-on-surface-variant">
                  {movie.genres.join(' • ')}
                </p>
              </div>

              <div
                className="absolute inset-0 bg-cover bg-center w-full h-full opacity-40 group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('${movie.posterUrl}')` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
