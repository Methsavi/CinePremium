import { useRef, useState, useEffect } from 'react';
import { Movie } from '@/types/movie';
import { Star, ArrowRight, Film, ChevronLeft, ChevronRight, Ticket, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NowPlayingSectionProps {
  movies: Movie[];
  onBookMovie: (movie: Movie) => void;
  onMovieClick?: (movie: Movie) => void;
  onViewAllClick?: () => void;
}

export const NowPlayingSection: React.FC<NowPlayingSectionProps> = ({
  movies,
  onBookMovie,
  onMovieClick,
  onViewAllClick
}) => {
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Check scroll position to update arrow states
  const updateScrollButtons = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate active card index
    const cardWidth = 260; // approximate card width + gap
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
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Auto-play / gentle auto-advance every 5 seconds when not hovered
  useEffect(() => {
    if (isHovered || movies.length <= 3) return;

    const interval = setInterval(() => {
      if (!sliderRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      
      if (scrollLeft >= scrollWidth - clientWidth - 20) {
        sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scroll('right');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, movies.length]);

  return (
    <section
      className="space-y-6 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Section Header & Slider Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Theatrical Screenings</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-on-surface font-display tracking-tight">
            Now Playing in Cinemas
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-full border border-white/10 shadow-inner">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Previous Movies"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Next Movies"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View All Button */}
          <button
            onClick={onViewAllClick || (() => navigate('/movies'))}
            className="text-red-500 cursor-pointer hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors px-3.5 py-1.5 rounded-full hover:bg-red-600/20 border border-red-500/30"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Movies Slider Container ── */}
      {movies.length === 0 ? (
        <div className="p-12 text-center text-zinc-400 flex flex-col items-center justify-center gap-2 bg-[#0d0d10] rounded-3xl border border-white/10">
          <Film className="w-10 h-10 opacity-30 text-red-500" />
          <h4 className="font-semibold text-white">No Movies Currently Found</h4>
          <p className="text-xs text-zinc-400">Check back later or adjust your genre filters.</p>
        </div>
      ) : (
        <div className="relative group">
          {/* Edge Fade Gradients for smooth carousel feel */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Scrollable Track */}
          <div
            ref={sliderRef}
            className="flex items-stretch gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-3 px-1 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => onMovieClick ? onMovieClick(movie) : navigate(`/movie/${movie.id}`)}
                className="w-56 sm:w-64 flex-shrink-0 snap-start bg-[#0d0d10] border border-white/10 hover:border-red-600/60 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_35px_rgba(229,9,20,0.25)] transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer group/card"
              >
                {/* Poster Box */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
                  <img
                    src={movie.posterUrl || movie.backdropUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-108"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d10] via-transparent to-black/40 opacity-70 group-hover/card:opacity-90 transition-opacity" />

                  {/* Rating Tag */}
                  {movie.rating && (
                    <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full text-xs text-amber-300 flex items-center gap-1 font-bold shadow-md">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{movie.rating}</span>
                    </div>
                  )}

                  {/* Live Status Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                      Live
                    </span>
                  </div>

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookMovie(movie);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xl shadow-red-600/40 hover:scale-105 transition-transform cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 fill-current" />
                      <span>Get Tickets</span>
                    </button>
                    <span className="text-[10px] text-zinc-300 font-medium">Click card for details</span>
                  </div>
                </div>

                {/* Movie Details Bottom with Fade Shadow */}
                <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#0d0d10] via-black to-[#0d0d10] border-t border-white/5">
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white truncate group-hover/card:text-red-500 transition-colors uppercase tracking-tight">
                      {movie.title}
                    </h4>
                    {movie.tagline && (
                      <p className="text-[11px] text-zinc-400 italic truncate">
                        "{movie.tagline}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1.5 border-t border-white/5">
                    <span className="truncate max-w-[120px]">
                      {movie.genres && Array.isArray(movie.genres) ? movie.genres.slice(0, 2).join(', ') : 'Cinema'}
                    </span>
                    {movie.duration && (
                      <span className="text-zinc-300 font-medium shrink-0">
                        {movie.duration}
                      </span>
                    )}
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
                    activeIndex === idx ? 'w-6 bg-primary shadow-[0_0_8px_rgba(229,9,20,0.6)]' : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default NowPlayingSection;
