import React, { useState } from 'react';
import { Movie } from '@/types/movie';
import { Star, Heart, Clock, Sparkles, Play, Ticket } from 'lucide-react';

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
    <div className="group relative bg-[#0d0d10] rounded-2xl overflow-hidden border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_15px_40px_rgba(229,9,20,0.25)] hover:border-red-600/50 transition-all duration-500 hover:-translate-y-1.5 flex flex-col h-full">
      {/* Poster Media Box */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
        <img
          src={movie.posterUrl || movie.backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Fade shadow gradient transitioning to details */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges (Rating & Like) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-amber-400 text-xs font-bold shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{movie.rating || '9.2'}</span>
          </div>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 cursor-pointer rounded-full backdrop-blur-md border transition-all ${
              isLiked
                ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/40'
                : 'bg-black/60 text-zinc-300 border-white/10 hover:bg-red-600 hover:text-white hover:border-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Hover Overlay with Glass Effect */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-5 space-y-3 text-center z-20">
          {movie.ageRating && (
            <span className="text-[11px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1 bg-red-950/40 border border-red-500/30 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> {movie.ageRating}
            </span>
          )}
          <h4 className="text-white font-black text-base sm:text-lg line-clamp-2 uppercase tracking-tight">{movie.title}</h4>
          {movie.tagline && (
            <p className="text-zinc-300 text-xs line-clamp-2 italic">"{movie.tagline}"</p>
          )}

          <div className="flex items-center gap-2 pt-2">
            {movie.trailerUrl && (
              <button
                onClick={() => onTrailerClick(movie.trailerUrl!)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all transform hover:scale-110 cursor-pointer shadow-lg"
                title="Watch Trailer"
              >
                <Play className="w-4 h-4 fill-white text-white" />
              </button>
            )}
            <button
              onClick={() => onBookClick(movie)}
              className="px-4 py-2 cursor-pointer rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book Now</span>
            </button>
          </div>
        </div>

        {/* Formats Tag */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1 z-10 pointer-events-none group-hover:opacity-0 transition-opacity">
          {(movie.formats || []).slice(0, 2).map((fmt) => (
            <span key={fmt} className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white shadow-md uppercase">
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Details Part with Fade Shadow Background */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3 bg-gradient-to-b from-[#0d0d10] via-black to-[#0d0d10] border-t border-white/5 relative shadow-inner">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-red-500" />
              {movie.duration || '2h 30m'}
            </span>
            <span className="text-red-500 font-bold uppercase text-[10px] tracking-wider">
              {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-black text-white group-hover:text-red-500 transition-colors line-clamp-1 uppercase tracking-tight">
            {movie.title}
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
            {movie.genres?.join(' • ') || 'Cinema Feature'}
          </p>
        </div>

        <button
          onClick={() => onBookClick(movie)}
          className="w-full py-2.5 cursor-pointer rounded-xl bg-zinc-900 hover:bg-red-600 border border-white/10 hover:border-red-500 text-white font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-red-600/30 hover:shadow-lg"
        >
          <span>{movie.status === 'now_showing' ? 'Book Tickets' : 'Notify Me'}</span>
        </button>
      </div>
    </div>
  );
};

export default MovieCard;