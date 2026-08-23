import React from 'react';
import { Movie } from '../types/movie';
import { X, Star, Clock, Calendar, Ticket, Play, Sparkles, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MovieFeedbackSection } from './MovieFeedbackSection';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Modal Glass Container */}
      <div
        className="relative w-full max-w-2xl bg-[#0b0b0e]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] shadow-red-950/30 overflow-hidden animate-in zoom-in-95 duration-250 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop Banner Header with Fade Shadow */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-black shrink-0">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/60 to-black/80" />

          {/* Close Glass Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/70 hover:bg-red-600 text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-xl z-20 hover:scale-105"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Status & Age Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg bg-red-600 text-white border border-red-500/50">
              {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
            </span>

            {movie.ageRating && (
              <span className="px-2.5 py-0.5 rounded-full bg-black/80 text-amber-300 border border-amber-500/30 text-xs font-bold backdrop-blur-md shadow-md">
                {movie.ageRating}
              </span>
            )}
          </div>

          {/* Floating Poster Overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4 z-10">
            <img
              src={movie.posterUrl || movie.backdropUrl}
              alt={movie.title}
              className="w-20 sm:w-28 h-28 sm:h-38 object-cover rounded-2xl border-2 border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.9)] shrink-0"
            />
            <div className="space-y-1 mb-1 min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-display drop-shadow-md leading-tight uppercase tracking-tight truncate">
                {movie.title}
              </h2>
              {movie.tagline && (
                <p className="text-xs text-zinc-300 italic drop-shadow line-clamp-1">
                  "{movie.tagline}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content Body with Glass & Fade Background */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-[#0b0b0e] custom-scrollbar">
          {/* Quick Metrics Glass Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-200 bg-zinc-950/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-inner">
            {movie.rating ? (
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{movie.rating} / 10</span>
              </div>
            ) : null}

            {movie.duration && (
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Clock className="w-4 h-4 text-red-500" />
                <span>{movie.duration}</span>
              </div>
            )}

            {movie.releaseDate && (
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>{movie.releaseDate}</span>
              </div>
            )}

            {movie.director && (
              <div className="text-xs text-zinc-400 truncate">
                Director: <span className="text-white font-medium">{movie.director}</span>
              </div>
            )}
          </div>

          {/* Genres Badges */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
                Genres
              </span>
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-red-600/15 text-red-400 border border-red-500/30 rounded-full text-xs font-bold backdrop-blur-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
              Overview & Storyline
            </span>
            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/40 p-3.5 rounded-2xl border border-white/5">
              {movie.synopsis || 'No synopsis provided for this title.'}
            </p>
          </div>

          {/* Formats if available */}
          {movie.formats && movie.formats.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
                Available Screen Formats
              </span>
              <div className="flex flex-wrap gap-1.5">
                {movie.formats.map((fmt, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs font-black text-white shadow-sm uppercase tracking-wider"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Audience Reviews & Feedback CRUD ── */}
          <MovieFeedbackSection movieId={movie.id} movieTitle={movie.title} />
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-4 sm:p-5 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-end gap-3 shrink-0 shadow-2xl">
          <button
            onClick={handleTrailer}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-red-500" />
            <span>Watch Trailer</span>
          </button>

          <button
            onClick={handleBookNow}
            className="bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/40 hover:scale-105 transition-all cursor-pointer"
          >
            <Ticket className="w-4 h-4 fill-current" />
            <span>Book Now (Select Showtimes)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickMovieInfoModal;
