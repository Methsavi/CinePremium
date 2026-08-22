import React from 'react';
import { Movie } from '@/types/movie';
import { Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NowPlayingSectionProps {
  movies: Movie[];
  onBookMovie: (movie: Movie) => void;
  onViewAllClick?: () => void;
}

export const NowPlayingSection: React.FC<NowPlayingSectionProps> = ({
  movies,
  onBookMovie,
  onViewAllClick
}) => {
  const navigate = useNavigate();

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-end border-b border-outline-variant pb-4">
        <h3 className="text-2xl sm:text-3xl font-semibold text-on-surface">Now Playing</h3>
        <button
          onClick={onViewAllClick}
          className="text-primary cursor-pointer hover:text-inverse-primary font-medium text-sm flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="movie-card group cursor-pointer flex flex-col gap-2"
          >
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-outline-variant group-hover:border-primary transition-colors">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />

              <div className="poster-overlay absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookMovie(movie);
                  }}
                  className="bg-primary text-on-primary text-xs font-semibold px-4 py-2 rounded-full hover:bg-inverse-primary transition-colors shadow-md"
                >
                  Get Tickets
                </button>
              </div>

              <div className="absolute top-2 right-2 bg-surface/80 backdrop-blur-sm border border-outline-variant px-2 py-1 rounded text-xs text-on-surface flex items-center gap-1 font-semibold">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                <span>{movie.rating}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-base text-on-surface truncate">
                {movie.title}
              </h4>
              <p className="text-xs text-on-surface-variant truncate">
                {movie.genres.join(' • ')} • {movie.duration}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
