import React, { useState } from 'react';
import { Movie } from '@/types/movie';
import { Star, Heart, Clock, Sparkles, Play } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onBookClick: (movie: Movie) => void;
  onTrailerClick: (trailerUrl: string) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onBookClick,
  onTrailerClick
}) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="group relative bg-slate-900/90 rounded-2xl overflow-hidden border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-1.5 flex flex-col h-full">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-amber-400 text-xs font-bold shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{movie.rating}</span>
          </div>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 cursor-pointer rounded-full backdrop-blur-md border transition-all ${
              isLiked
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/40'
                : 'bg-slate-950/60 text-slate-300 border-white/10 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
          </button>
        </div>

        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 space-y-3 text-center">
          {movie.ageRating && (
            <span className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> {movie.ageRating}
            </span>
          )}
          <h4 className="text-white font-bold text-lg line-clamp-2">{movie.title}</h4>
          {movie.tagline && (
            <p className="text-slate-300 text-xs line-clamp-3 italic">"{movie.tagline}"</p>
          )}

          <div className="flex items-center gap-2 pt-2">
            {movie.trailerUrl && (
              <button
                onClick={() => onTrailerClick(movie.trailerUrl!)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all transform hover:scale-110"
                title="Watch Trailer"
              >
                <Play className="w-5 h-5 fill-white" />
              </button>
            )}
            <button
              onClick={() => onBookClick(movie)}
              className="px-5 py-2.5 cursor-pointer rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:scale-105 transition-all"
            >
              Book Now
            </button>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1 z-10 pointer-events-none group-hover:opacity-0 transition-opacity">
          {(movie.formats || []).slice(0, 2).map((fmt) => (
            <span key={fmt} className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/80 text-white backdrop-blur-sm uppercase">
              {fmt}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {movie.duration}
            </span>
            <span className="text-red-400 font-semibold uppercase text-[10px] tracking-wider">
              {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
            </span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
            {movie.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
            {movie.genres.join(' • ')}
          </p>
        </div>

        <button
          onClick={() => onBookClick(movie)}
          className="w-full py-2.5 cursor-pointer rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 hover:text-white border border-white/10 text-slate-200 font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>{movie.status === 'now_showing' ? 'Book Tickets' : 'Notify Me'}</span>
        </button>
      </div>
    </div>
  );
};
export default MovieCard;