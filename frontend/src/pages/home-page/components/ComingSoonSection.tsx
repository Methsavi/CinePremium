import { useRef, useState, useEffect } from 'react';
import { Movie } from '@/types/movie';
import { Bell, ChevronLeft, ChevronRight, Sparkles, Calendar, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonSectionProps {
  movies: Movie[];
  onRemindMe: (movie: Movie) => void;
  onMovieClick?: (movie: Movie) => void;
}

export const ComingSoonSection: React.FC<ComingSoonSectionProps> = ({ movies, onRemindMe, onMovieClick }) => {
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!movies || movies.length === 0) {
    return null;
  }

  // Update scroll navigation states
  const updateScrollButtons = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = 340;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, movies.length - 1));
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener('scroll', updateScrollButtons, { passive: true });
    updateScrollButtons();

    return () => slider.removeEventListener('scroll', updateScrollButtons);
  }, [movies]);

  // Smooth scroll handler
  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Auto-slide every 6 seconds when not hovered
  useEffect(() => {
    if (isHovered || movies.length <= 2) return;

    const interval = setInterval(() => {
      if (!sliderRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;

      if (scrollLeft >= scrollWidth - clientWidth - 20) {
        sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scroll('right');
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isHovered, movies.length]);

  return (
    <section
      className="mt-12 space-y-6 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Section Header & Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upcoming Blockbusters</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-on-surface font-display tracking-tight">
            Coming Soon to Theaters
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Navigation Arrows */}
          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-full border border-white/10 shadow-inner">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Previous Upcoming Movies"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Next Upcoming Movies"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => navigate('/movies')}
            className="text-red-500 cursor-pointer hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors px-3.5 py-1.5 rounded-full hover:bg-red-600/20 border border-red-500/30"
          >
            <span>All Releases</span>
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Coming Soon Slider Track ── */}
      <div className="relative group">
        {/* Edge Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div
          ref={sliderRef}
          className="flex items-stretch gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-3 px-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => onMovieClick ? onMovieClick(movie) : navigate(`/movie/${movie.id}`)}
              className="w-80 sm:w-[360px] flex-shrink-0 snap-start bg-[#0d0d10] border border-white/10 hover:border-red-600/60 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_35px_rgba(229,9,20,0.25)] transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer group/card relative"
            >
              {/* Card Banner with Backdrop Image */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-black">
                <img
                  src={movie.backdropUrl || movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover opacity-75 group-hover/card:opacity-95 group-hover/card:scale-108 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-black/40 to-transparent" />

                {/* Release Date Pill */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-red-600 text-white backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{movie.releaseDate || 'Coming Soon'}</span>
                  </span>
                </div>

                {/* Rating if available */}
                {movie.rating ? (
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full text-xs text-amber-300 flex items-center gap-1 font-bold shadow-md">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{movie.rating}</span>
                  </div>
                ) : null}
              </div>

              {/* Card Body Details with Fade Shadow */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-gradient-to-b from-[#0d0d10] via-black to-[#0d0d10] border-t border-white/5">
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white group-hover/card:text-red-500 transition-colors line-clamp-1 uppercase tracking-tight">
                    {movie.title}
                  </h4>
                  {movie.tagline && (
                    <p className="text-xs text-zinc-400 italic line-clamp-1 mt-0.5">
                      "{movie.tagline}"
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                    {movie.synopsis}
                  </p>
                </div>

                {/* Genres & Remind Button */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1 max-w-[170px]">
                    {movie.genres && Array.isArray(movie.genres) ? (
                      movie.genres.slice(0, 2).map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-white/10 rounded-md text-[10px] font-semibold"
                        >
                          {genre}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400">Premiere</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemindMe(movie);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-600/15 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-sm whitespace-nowrap"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Remind Me</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Indicators */}
        {movies.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-3">
            {movies.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? 'w-6 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ComingSoonSection;
