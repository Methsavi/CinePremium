import React, { useState } from "react";
import { addMovie } from "../../../services/movieApi";
import { Film, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";

interface MoviesAddFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function MoviesAddForm({ onSuccess, onCancel }: MoviesAddFormProps) {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [rating, setRating] = useState("8.5");
  const [duration, setDuration] = useState("2h 15m");
  const [genres, setGenres] = useState("Sci-Fi, Action");
  const [status, setStatus] = useState<"now_showing" | "coming_soon">("now_showing");
  const [releaseDate, setReleaseDate] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");

  // Files & Previews
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [backdropPreview, setBackdropPreview] = useState<string | null>(null);

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
      formData.append("title", title);
      formData.append("tagline", tagline);
      formData.append("synopsis", synopsis);
      formData.append("rating", rating);
      formData.append("duration", duration);

      // Convert comma-separated string to genres array
      const genreArray = genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);
      
      genreArray.forEach((g) => formData.append("genres[]", g));

      formData.append("status", status);
      if (releaseDate) formData.append("releaseDate", releaseDate);
      if (trailerUrl) formData.append("trailerUrl", trailerUrl);

      if (posterFile) formData.append("poster", posterFile);
      if (backdropFile) formData.append("backdrop", backdropFile);

      await addMovie(formData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create movie");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#151b2d] border border-[#2e3447] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0c1324] border-b border-[#2e3447]">
          <div className="flex items-center gap-2 text-[#c0c1ff]">
            <Film className="w-5 h-5" />
            <h3 className="text-lg font-bold text-[#dce1fb]">Add New Movie</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[#908fa0] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1">
                Movie Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cyberpunk Nexus"
                className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. The future is unwritten."
                className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1">
              Synopsis *
            </label>
            <textarea
              required
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Enter a brief summary of the movie plot..."
              className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1">
                Rating (0 - 10)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2h 15m"
                className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff]"
              >
                <option value="now_showing">Now Showing</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1">
                Genres (Comma Separated)
              </label>
              <input
                type="text"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                placeholder="Sci-Fi, Action, Thriller"
                className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1">
                Release Date
              </label>
              <input
                type="text"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                placeholder="e.g. Releasing Nov 24"
                className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1">
              Trailer URL (YouTube Embed / Link)
            </label>
            <input
              type="text"
              value={trailerUrl}
              onChange={(e) => setTrailerUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff]"
            />
          </div>

          {/* Image Uploads to Cloudflare R2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Poster Upload */}
            <div className="border border-dashed border-[#2e3447] rounded-xl p-4 text-center bg-[#0c1324]/50 hover:border-[#c0c1ff] transition-colors">
              <label className="block text-xs font-semibold text-[#c0c1ff] mb-2 cursor-pointer">
                Movie Poster (Cloudflare R2)
              </label>
              {posterPreview ? (
                <div className="relative w-28 h-40 mx-auto mb-2 rounded-lg overflow-hidden border border-[#464554]">
                  <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPosterFile(null);
                      setPosterPreview(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
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
                id="poster-upload"
              />
              <label
                htmlFor="poster-upload"
                className="inline-block mt-1 text-xs font-medium text-[#c0c1ff] hover:underline cursor-pointer"
              >
                {posterFile ? posterFile.name : "Browse Poster File"}
              </label>
            </div>

            {/* Backdrop Upload */}
            <div className="border border-dashed border-[#2e3447] rounded-xl p-4 text-center bg-[#0c1324]/50 hover:border-[#c0c1ff] transition-colors">
              <label className="block text-xs font-semibold text-[#c0c1ff] mb-2 cursor-pointer">
                Backdrop Banner (Cloudflare R2)
              </label>
              {backdropPreview ? (
                <div className="relative w-44 h-24 mx-auto mb-2 rounded-lg overflow-hidden border border-[#464554]">
                  <img src={backdropPreview} alt="Backdrop preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setBackdropFile(null);
                      setBackdropPreview(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
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
                id="backdrop-upload"
              />
              <label
                htmlFor="backdrop-upload"
                className="inline-block mt-1 text-xs font-medium text-[#c0c1ff] hover:underline cursor-pointer"
              >
                {backdropFile ? backdropFile.name : "Browse Backdrop File"}
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2e3447]">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[#dce1fb] bg-[#191f31] hover:bg-[#2e3447] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-[#1000a9] bg-[#c0c1ff] hover:bg-white rounded-lg transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#1000a9] border-t-transparent rounded-full animate-spin" />
                  Uploading & Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Movie
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MoviesAddForm;
