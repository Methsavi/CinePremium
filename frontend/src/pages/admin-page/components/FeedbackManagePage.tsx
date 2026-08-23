import { useState, useEffect, useMemo } from 'react';
import { FeedbackReview } from '../../../types/review';
import { reviewApi } from '../../../services/reviewApi';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import {
  MessageSquare,
  Star,
  Trash2,
  Search,
  RefreshCw
} from 'lucide-react';

export default function FeedbackManagePage() {
  const { token } = useAuth();
  const { addNotification } = useNotification();

  const [reviews, setReviews] = useState<FeedbackReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [starFilter, setStarFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all reviews
  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewApi.getAllReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to load feedback records:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Handle Delete Review
  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this audience feedback?')) {
      return;
    }

    try {
      setDeletingId(id);
      await reviewApi.deleteReview(token, id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      addNotification({ message: 'Deleted Successfully', type: 'delete' });
    } catch (err: any) {
      addNotification({ message: 'Action Failed', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

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

  // Filter & Search Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const displayName = getDisplayName(rev.userName, rev.userEmail);
        const matchesUser = displayName.toLowerCase().includes(q) || rev.userEmail?.toLowerCase().includes(q);
        const matchesMovie = rev.movieTitle?.toLowerCase().includes(q);
        const matchesComment = rev.comment?.toLowerCase().includes(q);
        if (!matchesUser && !matchesMovie && !matchesComment) return false;
      }

      // Star Rating Filter
      if (starFilter !== 'all') {
        if (rev.rating !== Number(starFilter)) return false;
      }

      return true;
    });
  }, [reviews, searchQuery, starFilter]);

  return (
    <div className="space-y-6">
      {/* ── Header Title & Refresh ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Audience Feedbacks</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor customer reviews, ratings, and moderate audience submissions
          </p>
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-red-500/50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* ── Main Table Card Container ── */}
      <div className="bg-[#0d0d10] border border-white/10 rounded-xl overflow-hidden shadow-md">
        {/* Search Bar & Rating Filter in header */}
        <div className="p-5 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by movie, user, comment..."
              className="w-full bg-transparent border border-white/15 text-white placeholder:text-zinc-500 text-xs sm:text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', '5', '4', '3', '2', '1'].map((st) => (
              <button
                key={st}
                onClick={() => setStarFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  starFilter === st
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {st === 'all' ? (
                  'All Stars'
                ) : (
                  <>
                    <span>{st}</span>
                    <Star className="w-3 h-3 fill-current text-amber-300" />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Reviews Table ── */}
        {loading ? (
          <div className="p-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
            <span className="text-xs">Loading audience feedback records...</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 flex flex-col items-center gap-2">
            <MessageSquare className="w-10 h-10 text-zinc-700" />
            <p className="text-sm font-semibold text-zinc-300">No feedback records found</p>
            <p className="text-xs text-zinc-500">Reviews submitted by users will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-t border-b border-white/10 text-xs font-semibold text-zinc-400">
                  <th className="px-6 py-3.5">Reviewer & Movie</th>
                  <th className="px-6 py-3.5">Score</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Feedback Comment</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReviews.map((rev, idx) => {
                  const displayName = getDisplayName(rev.userName, rev.userEmail);
                  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : 'U';
                  const avatarColors = [
                    'bg-red-600', 'bg-zinc-700', 'bg-red-700', 'bg-zinc-800', 'bg-red-800'
                  ];
                  const avatarBg = avatarColors[idx % avatarColors.length];

                  return (
                    <tr
                      key={rev.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* User & Movie */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                            {avatarLetter}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{displayName}</div>
                            <div className="text-xs text-red-400 font-medium uppercase tracking-tight">
                              {rev.movieTitle || 'Movie'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{rev.rating} / 5</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-emerald-400">
                          Active
                        </span>
                      </td>

                      {/* Comment */}
                      <td className="px-6 py-4">
                        <p className="text-xs text-zinc-300 line-clamp-2 max-w-sm">
                          "{rev.comment}"
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-US')}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleDelete(rev.id)}
                          disabled={deletingId === rev.id}
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Feedback"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
