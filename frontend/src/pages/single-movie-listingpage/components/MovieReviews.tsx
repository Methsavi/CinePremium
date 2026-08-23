import React from 'react';
import { Review } from '@/types/movie';
import { MessageSquare, Star } from 'lucide-react';

interface MovieReviewsProps {
  reviews?: Review[];
}

export const MovieReviews: React.FC<MovieReviewsProps> = ({ reviews = [] }) => {
  if (reviews.length === 0) return null;

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 sm:p-8 border border-outline-variant space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-display">
        <MessageSquare className="w-5 h-5 text-primary" />
        <span>Audience Reviews ({reviews.length})</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-4 rounded-xl bg-surface-container border border-outline-variant/60 flex flex-col justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-white">{rev.author || 'User'}</span>
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(rev.rating)
                        ? 'fill-primary text-primary'
                        : 'text-on-surface-variant/40'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant italic leading-relaxed">
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
