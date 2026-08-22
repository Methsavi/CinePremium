import React from 'react';
import { Movie } from '@/types/movie';
import { Star, Ticket, Play } from 'lucide-react';

interface MovieHeroProps {
  movie: Movie;
  onBookClick: () => void;
  onTrailerClick: (trailerUrl: string) => void;
}

export const MovieHero: React.FC<MovieHeroProps> = ({
  movie,
  onBookClick,
  onTrailerClick
}) => {
  return (
    <section className="relative w-full h-[70vh] min-h-[600px] flex items-end pb-12 pt-20">
      {/* Background Image with Dark Overlays */}
      <div
        className="absolute inset-0 z-0 bg-surface-container bg-cover bg-center"
        style={{ backgroundImage: `url('${movie.backdropUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-end">
          {/* Desktop Poster */}
          <div className="hidden md:block w-64 flex-shrink-0 rounded-xl overflow-hidden border border-outline-variant shadow-2xl">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-auto object-cover aspect-[2/3]"
            />
          </div>

          {/* Details & Actions */}
          <div className="flex flex-col gap-4 flex-grow pb-4">
            {/* Meta Tags */}
            <div className="flex flex-wrap gap-2 items-center">
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-medium"
                >
                  {genre}
                </span>
              ))}

              <div className="flex items-center gap-1 text-primary">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="text-sm font-bold">{movie.rating}</span>
              </div>

              <span className="text-on-surface-variant text-sm border-l border-outline-variant pl-2">
                {movie.duration}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface leading-tight">
              {movie.title}
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-2">
              <button
                onClick={onBookClick}
                className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold text-sm hover:bg-primary-container transition-colors duration-200 flex items-center gap-2 shadow-lg"
              >
                <Ticket className="w-5 h-5 fill-current" />
                <span>Book Tickets</span>
              </button>

              {movie.trailerUrl && (
                <button
                  onClick={() => onTrailerClick(movie.trailerUrl!)}
                  className="border border-outline-variant text-on-surface bg-surface-dim/50 backdrop-blur-sm px-8 py-3 rounded-lg font-medium text-sm hover:border-primary hover:text-primary transition-colors duration-200 flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play Trailer</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
