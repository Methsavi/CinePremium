import React from 'react';
import { Movie } from '../types/movie';
import { X, Star, Clock, Calendar, Ticket, Play, Sparkles, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickMovieInfoModalProps {
  movie: Movie | null;
  onClose: () => void;
  onWatchTrailer: (trailerUrl: string) => void;
}

export const QuickMovieInfoModal: React.FC<QuickMovieInfoModalProps> = ({
  movie,
  onClose,
  onWatchTrailer,
}) => {
  const navigate = useNavigate();

  if (!movie) return null;

  const handleBookNow = () => {
    onClose();
    navigate(`/movie/${movie.id}`);
  };

  const handleTrailer = () => {
    onWatchTrailer(movie.trailerUrl || `https://www.youtube.com/watch?v=JfVOs4VSpmA`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#151b2d] border border-white/15 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-250 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop Banner Header */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#0c1324] shrink-0">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151b2d] via-[#151b2d]/40 to-black/60" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Status & Age Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
                movie.status === 'now_showing'
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-amber-500/90 text-white'
              }`}
            >
              {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
            </span>

            {movie.ageRating && (
              <span className="px-2.5 py-0.5 rounded-full bg-black/70 text-amber-300 border border-amber-500/30 text-xs font-bold backdrop-blur-sm">
                {movie.ageRating}
              </span>
            )}
          </div>

          {/* Floating Poster Overlay */}
          <div className="absolute bottom-4 left-6 flex items-end gap-4">
            <img
              src={movie.posterUrl || movie.backdropUrl}
              alt={movie.title}
              className="w-20 sm:w-24 h-28 sm:h-34 object-cover rounded-xl border-2 border-white/20 shadow-2xl shrink-0"
            />
            <div className="space-y-1 mb-1">
              <h2 className="text-xl sm:text-2xl font-black text-white font-display drop-shadow-md leading-tight">
                {movie.title}
              </h2>
              {movie.tagline && (
                <p className="text-xs text-[#c0c1ff] italic drop-shadow line-clamp-1">
                  "{movie.tagline}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#dce1fb] bg-[#0c1324] p-3 rounded-2xl border border-[#2e3447]">
            {movie.rating ? (
              <div className="flex items-center gap-1 font-bold text-amber-300">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{movie.rating} / 10</span>
              </div>
            ) : null}

            {movie.duration && (
              <div className="flex items-center gap-1 text-[#c7c4d7]">
                <Clock className="w-4 h-4 text-[#908fa0]" />
                <span>{movie.duration}</span>
              </div>
            )}

            {movie.releaseDate && (
              <div className="flex items-center gap-1 text-[#c7c4d7]">
                <Calendar className="w-4 h-4 text-[#908fa0]" />
                <span>{movie.releaseDate}</span>
              </div>
            )}

            {movie.director && (
              <div className="text-xs text-[#908fa0] truncate">
                Dir: <span className="text-white">{movie.director}</span>
              </div>
            )}
          </div>

          {/* Genres Badges */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider block">
                Genres
              </span>
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary border border-primary/25 rounded-full text-xs font-semibold"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider block">
              Overview & Storyline
            </span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {movie.synopsis || 'No synopsis provided for this title.'}
            </p>
          </div>

          {/* Formats if available */}
          {movie.formats && movie.formats.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#908fa0] uppercase tracking-wider block">
                Available Screen Formats
              </span>
              <div className="flex flex-wrap gap-1.5">
                {movie.formats.map((fmt, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md bg-[#0c1324] border border-[#2e3447] text-xs font-bold text-[#c0c1ff]"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 sm:p-5 bg-[#0c1324] border-t border-[#2e3447] flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleTrailer}
            className="liquid-glass-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white hover:text-primary transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-primary" />
            <span>Watch Trailer</span>
          </button>

          <button
            onClick={handleBookNow}
            className="liquid-glow-btn text-surface-container-lowest font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-xl cursor-pointer"
          >
            <Ticket className="w-4 h-4 fill-current" />
            <span>Book Now (Select Showtimes & Halls)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickMovieInfoModal;
