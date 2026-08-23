import React, { useState } from "react";
import { updateMovie } from "../../../services/movieApi";
import { Movie } from "../../../types/movie";
import { useNotification } from "../../../context/NotificationContext";
import { Film, Upload, X, AlertCircle } from "lucide-react";

interface MoviesEditFormProps {
  movie: Movie;
  onSuccess: () => void;
  onCancel: () => void;
}

function MoviesEditForm({ movie, onSuccess, onCancel }: MoviesEditFormProps) {
  const { addNotification } = useNotification();
  const [title, setTitle] = useState(movie.title || "");
  const [tagline, setTagline] = useState(movie.tagline || "");
  const [synopsis, setSynopsis] = useState(movie.synopsis || "");
  const [rating, setRating] = useState(movie.rating ? String(movie.rating) : "8.5");
  const [duration, setDuration] = useState(movie.duration || "2h 15m");
  const [genres, setGenres] = useState(
    movie.genres && Array.isArray(movie.genres) ? movie.genres.join(", ") : ""
  );
  const [status, setStatus] = useState<"now_showing" | "coming_soon">(
    movie.status || "now_showing"
  );
  const [releaseDate, setReleaseDate] = useState(movie.releaseDate || "");
  const [trailerUrl, setTrailerUrl] = useState(movie.trailerUrl || "");

  // Files & Previews
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(movie.posterUrl || null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [backdropPreview, setBackdropPreview] = useState<string | null>(movie.backdropUrl || null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleBackdropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackdropFile(file);
      setBackdropPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!synopsis.trim()) {
      setError("Synopsis is required");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("tagline", tagline.trim());
      formData.append("synopsis", synopsis.trim());
      formData.append("rating", rating);
      formData.append("duration", duration.trim());

      const genreArray = genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

      genreArray.forEach((g) => formData.append("genres[]", g));

      formData.append("status", status);
      formData.append("releaseDate", releaseDate.trim());
      formData.append("trailerUrl", trailerUrl.trim());

      if (posterFile) {
        formData.append("poster", posterFile);
      } else if (posterPreview) {
        formData.append("posterUrl", posterPreview);
      }

      if (backdropFile) {
        formData.append("backdrop", backdropFile);
      } else if (backdropPreview) {
        formData.append("backdropUrl", backdropPreview);
      }

      await updateMovie(movie.id, formData);

      addNotification({
        type: 'success',
        message: 'Updated Successfully'
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update movie");
      addNotification({
        type: 'error',
        message: 'Action Failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="relative w-full max-w-3xl bg-[#0b0b0e]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950/80 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight">Edit Movie Details</h3>
              <p className="text-[11px] text-zinc-400">Update metadata for "{movie.title}"</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-900 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                  Movie Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                Synopsis *
              </label>
              <textarea
                required
                rows={3}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                  Rating (0 - 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-white/10 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                >
                  <option value="now_showing">Now Showing</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                  Genres (comma separated)
                </label>
                <input
                  type="text"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                  Release Date
                </label>
                <input
                  type="text"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                Trailer YouTube Embed Link
              </label>
              <input
                type="text"
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Poster & Backdrop File Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                  Change Poster
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-red-500/50 rounded-2xl p-4 cursor-pointer bg-zinc-950 transition-colors">
                  <Upload className="w-6 h-6 text-zinc-500 mb-1" />
                  <span className="text-xs text-zinc-300 font-medium">Click to select new poster</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="hidden"
                  />
                </label>
                {posterPreview && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-zinc-950 rounded-xl border border-white/10">
                    <img src={posterPreview} alt="Poster" className="w-8 h-12 object-cover rounded" />
                    <span className="text-xs text-zinc-300 truncate">{posterFile?.name || "Current Poster Active"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                  Change Backdrop
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-red-500/50 rounded-2xl p-4 cursor-pointer bg-zinc-950 transition-colors">
                  <Upload className="w-6 h-6 text-zinc-500 mb-1" />
                  <span className="text-xs text-zinc-300 font-medium">Click to select new backdrop</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackdropChange}
                    className="hidden"
                  />
                </label>
                {backdropPreview && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-zinc-950 rounded-xl border border-white/10">
                    <img src={backdropPreview} alt="Backdrop" className="w-12 h-8 object-cover rounded" />
                    <span className="text-xs text-zinc-300 truncate">{backdropFile?.name || "Current Backdrop Active"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-4 bg-zinc-950/80 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Saving Changes..." : "Update Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MoviesEditForm;
