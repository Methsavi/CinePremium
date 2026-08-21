import React, { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';
import { Play, Ticket, Star, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface HeroCarouselProps {
  movies: Movie[];
  onBookClick: (movie: Movie) => void;
  onTrailerClick: (trailerUrl: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  movies,
  onBookClick,
  onTrailerClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredMovies = movies.filter(m => m.isFeatured);
  const currentMovie = featuredMovies[currentIndex] || featuredMovies[0];

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  if (!currentMovie) return null;

  return (
    <div className="relative w-full h-[520px] sm:h-[620px] lg:h-[680px] overflow-hidden bg-slate-950">
      <div 
        key={currentMovie.id}
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{ backgroundImage: `url(${currentMovie.backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
      </div>

      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl text-white space-y-6 pt-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600/90 text-white tracking-wider uppercase shadow-lg shadow-red-600/30">
              <Sparkles className="w-3.5 h-3.5" /> Featured Premiere
            </span>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{currentMovie.rating}</span>
            </div>
            <span className="text-xs text-slate-300 flex items-center gap-1 bg-slate-900/60 px-2.5 py-1 rounded-full border border-white/10">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {currentMovie.duration}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-2xl leading-none">
              {currentMovie.title}
            </h1>
            {currentMovie.tagline && (
              <p className="text-lg sm:text-xl text-amber-300/90 font-medium italic drop-shadow-md">
                "{currentMovie.tagline}"
              </p>
            )}
          </div>

          <p className="text-slate-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-xl font-normal drop-shadow">
            {currentMovie.synopsis}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {currentMovie.genres.map((genre) => (
              <span key={genre} className="px-3 py-1 text-xs rounded-lg bg-white/10 border border-white/15 text-slate-200 font-medium backdrop-blur-md">
                {genre}
              </span>
            ))}
            {(currentMovie.formats || []).map((fmt) => (
              <span key={fmt} className="px-3 py-1 text-xs rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-bold uppercase tracking-wider">
                {fmt}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onBookClick(currentMovie)}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-bold text-base shadow-xl shadow-red-600/40 hover:shadow-red-600/60 hover:scale-105 transition-all duration-300"
            >
              <Ticket className="w-5 h-5 fill-white" />
              <span>Book Tickets</span>
            </button>

            {currentMovie.trailerUrl && (
              <button
                onClick={() => onTrailerClick(currentMovie.trailerUrl!)}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base backdrop-blur-xl transition-all duration-300 hover:scale-105"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Watch Trailer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {featuredMovies.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-3">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length)}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-red-600 text-white border border-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredMovies.length)}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-red-600 text-white border border-white/10 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
