import { Movie, Cinema } from "@/types/movie";
import { MovieHero } from "./MovieHero";
import { MovieShowtimes } from "./MovieShowtimes";

type MovieDetailsProps = {
  movie: Movie;
  onBookClick: (movie: Movie) => void;
  onTrailerClick: (trailerUrl: string) => void;
  onSelectShowtime?: (showtimeData: any) => void;
};

export default function MovieDetails({
  movie,
  onBookClick,
  onTrailerClick,
  onSelectShowtime
}: MovieDetailsProps) {
  return (
    <div className="w-full space-y-6">
      {/* 1. Compact Hero Section with integrated synopsis/description */}
      <MovieHero
        movie={movie}
        onBookClick={() => onBookClick(movie)}
        onTrailerClick={onTrailerClick}
      />

      {/* 2. Showtimes & Auditoriums Section */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 pb-16">
        <MovieShowtimes movie={movie} onSelectShowtime={onSelectShowtime} />
      </div>
    </div>
  );
}