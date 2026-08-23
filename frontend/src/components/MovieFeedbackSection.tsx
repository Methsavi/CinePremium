import React, { useState, useEffect } from 'react';
import { FeedbackReview } from '../types/review';
import { reviewApi } from '../services/reviewApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Star,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  Check,
  Clock,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MovieFeedbackSectionProps {
  movieId: string;
  movieTitle?: string;
  onReviewCountChange?: (count: number, avgRating: number) => void;
}

export const MovieFeedbackSection: React.FC<MovieFeedbackSectionProps> = ({
  movieId,
  movieTitle,
  onReviewCountChange
}) => {
  const { user, token, isAuthenticated } = useAuth();
  const { addNotification } = useNotification();

  const [reviews, setReviews] = useState<FeedbackReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Helper to ensure proper username display
  const getDisplayName = (userName?: string, userEmail?: string) => {
    if (userName && userName !== 'Verified Cinephile' && userName.trim() !== '') {
      return userName;
    }
    if (userEmail) {
      const prefix = userEmail.split('@')[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'User';
  };

  // New review form state
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');

  // Editing state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editComment, setEditComment] = useState<string>('');
  const [editLoading, setEditLoading] = useState<boolean>(false);

  // Load reviews for this movie
  const loadReviews = async () => {
    if (!movieId) return;
    try {
      setLoading(true);
      const data = await reviewApi.getMovieReviews(movieId);
      setReviews(data || []);

      if (onReviewCountChange && data) {
        const count = data.length;
        const avg = count > 0 ? data.reduce((acc, r) => acc + r.rating, 0) / count : 0;
        onReviewCountChange(count, avg);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [movieId]);

  // Average Rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  // Handle New Review Submit
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isAuthenticated) {
      addNotification({ message: 'Please sign in first', type: 'error' });
      return;
    }
    if (!newComment.trim()) {
      addNotification({ message: 'Comment cannot be empty', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const created = await reviewApi.createReview(token, movieId, {
        rating: newRating,
        comment: newComment.trim(),
        movieTitle: movieTitle || 'Movie Feature'
      });

      setReviews((prev) => [created, ...prev]);
      setNewComment('');
      setNewRating(5);
      addNotification({ message: 'Added Successfully', type: 'add' });

      if (onReviewCountChange) {
        const updated = [created, ...reviews];
        const avg = updated.reduce((acc, r) => acc + r.rating, 0) / updated.length;
        onReviewCountChange(updated.length, avg);
      }
    } catch (err: any) {
      addNotification({ message: 'Failed to add review', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Start Editing
  const startEdit = (review: FeedbackReview) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
  };

  // Save Edit
  const handleSaveEdit = async (reviewId: string) => {
    if (!token) return;
    if (!editComment.trim()) {
      addNotification({ message: 'Comment cannot be empty', type: 'error' });
      return;
    }

    try {
      setEditLoading(true);
      const updated = await reviewApi.updateReview(token, reviewId, {
        rating: editRating,
        comment: editComment.trim()
      });

      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, rating: updated.rating, comment: updated.comment } : r))
      );
      setEditingReviewId(null);
      addNotification({ message: 'Updated Successfully', type: 'success' });
    } catch (err: any) {
      addNotification({ message: 'Failed to update review', type: 'error' });
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewApi.deleteReview(token, reviewId);
      const updated = reviews.filter((r) => r.id !== reviewId);
      setReviews(updated);
      addNotification({ message: 'Deleted Successfully', type: 'delete' });

      if (onReviewCountChange) {
        const count = updated.length;
        const avg = count > 0 ? updated.reduce((acc, r) => acc + r.rating, 0) / count : 0;
        onReviewCountChange(count, avg);
      }
    } catch (err: any) {
      addNotification({ message: 'Failed to delete review', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 shadow-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              Audience Reviews & Ratings
            </h3>
            <p className="text-xs text-zinc-400">
              Verified community thoughts and ratings ({reviews.length})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/10">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-mono text-sm font-black text-amber-400">{averageRating}</span>
          <span className="text-[10px] text-zinc-500">/ 5</span>
        </div>
      </div>

      {/* ── 1. Create Review Form / Login Prompt ── */}
      {isAuthenticated ? (
        <form
          onSubmit={handleCreateReview}
          className="p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-white/10 space-y-3 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-bold text-white">Share your review as {user?.name}</span>
            </div>

            {/* Interactive 1-5 Star Picker */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-400 mr-1 font-medium">Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 cursor-pointer transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      (hoverRating || newRating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono font-bold text-amber-400 ml-1">
                {hoverRating || newRating} / 5
              </span>
            </div>
          </div>

          <textarea
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your honest movie experience or thoughts..."
            className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 transition-all resize-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg transition-all ${
                submitting || !newComment.trim()
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-red-600/30 hover:scale-102'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Posting...' : 'Post Review'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-white block">Watched this movie?</span>
            <span className="text-[11px] text-zinc-400">
              Sign in to rate this film and share your audience review.
            </span>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-red-600/15 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Review</span>
          </Link>
        </div>
      )}

      {/* ── 2. Reviews Feed List ── */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-400">
            Loading feedbacks...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950/60 rounded-2xl border border-white/10 text-zinc-400 space-y-1">
            <MessageSquare className="w-6 h-6 text-red-500 mx-auto mb-1 opacity-60" />
            <p className="text-xs font-bold text-white">No reviews yet for this movie.</p>
            <p className="text-[11px] text-zinc-400">Be the first to share your thoughts!</p>
          </div>
        ) : (
          reviews.map((rev) => {
            const isAuthor = user && (rev.userId === user.id || rev.userId === (user as any)._id);
            const isAdmin = user && ['admin', 'cinema_manager'].includes(user.role);
            const isEditing = editingReviewId === rev.id;

            return (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-2.5 transition-all shadow-sm"
              >
                {isEditing ? (
                  /* Inline Edit Form */
                  <div className="space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">Edit Your Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className="p-0.5 cursor-pointer"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                editRating >= star
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-700'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white cursor-pointer border border-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(rev.id)}
                        disabled={editLoading || !editComment.trim()}
                        className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white flex items-center gap-1 cursor-pointer shadow-md shadow-red-600/30"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{editLoading ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Review Card */
                  <>
                    <div className="flex items-center justify-between gap-2">
                      {/* User Info */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/10 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {getDisplayName(rev.userName, rev.userEmail).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white truncate">
                              {getDisplayName(rev.userName, rev.userEmail)}
                            </span>
                            {isAuthor && (
                              <span className="px-1.5 py-0.2 rounded bg-red-600/20 text-red-400 text-[9px] font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-red-500" />
                            <span>{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </span>
                        </div>
                      </div>

                      {/* Right: Stars & Action Buttons */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Author Edit & Delete Actions */}
                        {isAuthor && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(rev)}
                              className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 cursor-pointer"
                              title="Edit feedback"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1 text-red-400 hover:text-red-300 rounded-md hover:bg-red-500/10 cursor-pointer"
                              title="Delete feedback"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Admin Delete Action if not author */}
                        {!isAuthor && isAdmin && (
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1 text-red-400 hover:text-red-300 rounded-md hover:bg-red-500/10 cursor-pointer"
                            title="Admin: Delete feedback"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-9">
                      "{rev.comment}"
                    </p>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MovieFeedbackSection;
