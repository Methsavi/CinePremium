import { Movie, Cinema } from "@/types/movie";
import { MovieHero } from "./MovieHero";
import { MovieSynopsis } from "./MovieSynopsis";
import { MovieCast } from "./MovieCast";
import { MovieShowtimes } from "./MovieShowtimes";
import { MovieReviews } from "./MovieReviews";

type MovieDetailsProps = {
  movie: Movie;
  onBookClick: (movie: Movie) => void;
  onTrailerClick: (trailerUrl: string) => void;
  onSelectShowtime: (cinema: Cinema, showtimeId: string) => void;
};

export default function MovieDetails({
  movie,
  onBookClick,
  onTrailerClick,
  onSelectShowtime
}: MovieDetailsProps) {
  return (
    <div className="w-full space-y-4">
      {/* Hero Section */}
      <MovieHero
        movie={movie}
        onBookClick={() => onBookClick(movie)}
        onTrailerClick={onTrailerClick}
      />

      {/* Content Grid */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-12 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Synopsis & Cast */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <MovieSynopsis synopsis={movie.synopsis} />
          <MovieCast castMembers={movie.castMembers} />
        </div>

        {/* Right Column: Showtimes & Reviews */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <MovieShowtimes movie={movie} onSelectShowtime={onSelectShowtime} />
          <MovieReviews reviews={movie.reviews} />
        </div>
      </section>
    </div>
  );
}