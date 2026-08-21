import React from 'react';
import { HERO_MOVIE } from '@/data/movies';
import { Ticket, Play } from 'lucide-react';

interface HeroSectionProps {
  onBookClick: () => void;
  onTrailerClick: (trailerUrl: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBookClick,
  onTrailerClick
}) => {
  return (
    <section className="relative w-full h-[716px] min-h-[600px] flex items-end justify-center mb-8">
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute inset-0 bg-cover bg-center w-full h-full"
          style={{ backgroundImage: `url('${HERO_MOVIE.backdropUrl}')` }}
        />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1280px] px-6 md:px-12 pb-12 flex flex-col items-start gap-4">
        <span className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-semibold uppercase tracking-widest border border-outline-variant">
          Featured Premiere
        </span>

        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface max-w-3xl leading-tight">
          {HERO_MOVIE.title}
        </h2>

        <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mb-2 leading-relaxed">
          {HERO_MOVIE.synopsis}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onBookClick}
            className="bg-primary cursor-pointer text-on-primary font-medium text-sm sm:text-base px-8 py-3 rounded-full hover:bg-inverse-primary transition-colors flex items-center gap-2 shadow-lg"
          >
            <Ticket className="w-5 h-5 fill-current" />
            <span>Book Now</span>
          </button>

          {HERO_MOVIE.trailerUrl && (
            <button
              onClick={() => onTrailerClick(HERO_MOVIE.trailerUrl!)}
              className="bg-surface/50 cursor-pointer backdrop-blur-sm border border-outline-variant text-on-surface font-medium text-sm sm:text-base px-8 py-3 rounded-full hover:bg-surface-variant transition-colors flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Watch Trailer</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
