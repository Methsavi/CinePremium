import React from 'react';
import { Movie } from '@/types/movie';
import { Star, Play, Clock } from 'lucide-react';

interface MovieHeroProps {
  movie: Movie;
  onBookClick?: () => void;
  onTrailerClick: (trailerUrl: string) => void;
}

export const MovieHero: React.FC<MovieHeroProps> = ({
  movie,
  onTrailerClick
}) => {
  return (
    <section className="relative w-full min-h-[380px] md:min-h-[420px] flex items-end pb-8 pt-24 overflow-hidden">
      {/* Background Image with Dark Gradient Overlays */}
      <div
        className="absolute inset-0 z-0 bg-surface-container bg-cover bg-center"
        style={{ backgroundImage: `url('${movie.backdropUrl || movie.posterUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-start sm:items-end">
          {/* Desktop / Tablet Poster Thumbnail */}
          <div className="hidden sm:block w-36 sm:w-44 md:w-52 flex-shrink-0 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img
              src={movie.posterUrl || movie.backdropUrl}
              alt={movie.title}
              className="w-full h-auto object-cover aspect-[2/3] hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Details & Description */}
          <div className="flex flex-col gap-2.5 flex-grow pb-1 min-w-0">
            {/* Meta Tags */}
            <div className="flex flex-wrap gap-2 items-center">
              {movie.genres?.map((genre) => (
                <span
                  key={genre}
                  className="px-2.5 py-0.5 bg-surface-variant/90 border border-outline-variant text-on-surface-variant rounded-full text-[11px] font-semibold"
                >
                  {genre}
                </span>
              ))}

              {movie.rating > 0 && (
                <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{movie.rating}</span>
                </div>
              )}

              {movie.duration && (
                <span className="text-on-surface-variant text-xs flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{movie.duration}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tight">
              {movie.title}
            </h1>

            {/* Tagline or Description (Synopsis directly in Hero) */}
            {movie.tagline && (
              <p className="text-xs sm:text-sm font-semibold text-primary/90 italic -mt-1">
                {movie.tagline}
              </p>
            )}

            {movie.synopsis && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl line-clamp-3 leading-relaxed">
                {movie.synopsis}
              </p>
            )}

            {/* Action Buttons */}
            {movie.trailerUrl && (
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => onTrailerClick(movie.trailerUrl!)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-102"
                >
                  <Play className="w-4 h-4 fill-current text-primary" />
                  <span>Watch Trailer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MovieHero;
