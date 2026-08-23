import React, { useState } from "react";
import { updateMovie } from "../../../services/movieApi";
import { Movie } from "../../../types/movie";
import { useNotification } from "../../../context/NotificationContext";
import { Film, Upload, X, CheckCircle2, AlertCircle, Edit3 } from "lucide-react";

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

      // Convert comma-separated string to genres array
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
        type: 'info',
        title: 'Movie Updated 🎬',
        message: `Movie "${title}" details were successfully updated.`,
        actionUrl: '/movies',
        actionLabel: 'View in Catalog'
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update movie");
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: err instanceof Error ? err.message : "Failed to update movie."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="relative w-full max-w-3xl bg-[#151b2d] border border-white/15 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#0c1324] border-b border-[#2e3447] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Edit Movie — {movie.title}</h3>
              <p className="text-[11px] text-[#908fa0]">Update movie information and assets</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#908fa0] hover:text-white p-2 rounded-xl hover:bg-[#2e3447] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1.5">
                  Movie Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk Nexus"
                  className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1.5">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. The future is unwritten."
                  className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1.5">
                Synopsis *
              </label>
              <textarea
                required
                rows={3}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Enter a brief summary of the movie plot..."
                className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1.5">
                  Rating (0 - 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1.5">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2h 15m"
                  className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors cursor-pointer"
                >
                  <option value="now_showing">Now Showing</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1.5">
                  Genres (Comma Separated)
                </label>
                <input
                  type="text"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  placeholder="Sci-Fi, Action, Thriller"
                  className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1.5">
                  Release Date
                </label>
                <input
                  type="text"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  placeholder="e.g. Releasing Nov 24"
                  className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1.5">
                Trailer URL (YouTube Video / Embed)
              </label>
              <input
                type="text"
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors"
              />
            </div>

            {/* Image Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Poster Upload */}
              <div className="border border-dashed border-[#2e3447] rounded-2xl p-4 text-center bg-[#0c1324]/50 hover:border-primary/50 transition-colors">
                <label className="block text-xs font-semibold text-[#c0c1ff] mb-2 cursor-pointer">
                  Movie Poster Image
                </label>
                {posterPreview ? (
                  <div className="relative w-28 h-40 mx-auto mb-2 rounded-xl overflow-hidden border border-[#464554] shadow-md">
                    <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPosterFile(null);
                        setPosterPreview(null);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Upload className="w-6 h-6 text-[#908fa0] mb-1" />
                    <span className="text-xs text-[#908fa0]">Click to select poster image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterChange}
                  className="hidden"
                  id="edit-poster-upload"
                />
                <label
                  htmlFor="edit-poster-upload"
                  className="inline-block mt-1 text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  {posterFile ? posterFile.name : "Replace Poster File"}
                </label>
              </div>

              {/* Backdrop Upload */}
              <div className="border border-dashed border-[#2e3447] rounded-2xl p-4 text-center bg-[#0c1324]/50 hover:border-primary/50 transition-colors">
                <label className="block text-xs font-semibold text-[#c0c1ff] mb-2 cursor-pointer">
                  Backdrop Banner Image
                </label>
                {backdropPreview ? (
                  <div className="relative w-44 h-24 mx-auto mb-2 rounded-xl overflow-hidden border border-[#464554] shadow-md">
                    <img src={backdropPreview} alt="Backdrop preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setBackdropFile(null);
                        setBackdropPreview(null);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Upload className="w-6 h-6 text-[#908fa0] mb-1" />
                    <span className="text-xs text-[#908fa0]">Click to select backdrop banner</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackdropChange}
                  className="hidden"
                  id="edit-backdrop-upload"
                />
                <label
                  htmlFor="edit-backdrop-upload"
                  className="inline-block mt-1 text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  {backdropFile ? backdropFile.name : "Replace Backdrop File"}
                </label>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-4 bg-[#0c1324] border-t border-[#2e3447] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#dce1fb] bg-[#191f31] hover:bg-[#2e3447] rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="liquid-glow-btn text-surface-container-lowest text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-surface-container-lowest border-t-transparent rounded-full animate-spin" />
                  <span>Updating Movie...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MoviesEditForm;
