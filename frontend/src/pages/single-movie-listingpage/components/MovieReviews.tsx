import React from 'react';
import { Review } from '@/types/movie';
import { MessageSquare, Star } from 'lucide-react';

interface MovieReviewsProps {
  reviews?: Review[];
}

export const MovieReviews: React.FC<MovieReviewsProps> = ({ reviews = [] }) => {
  if (reviews.length === 0) return null;

  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant space-y-4">
      <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <span>Audience Reviews</span>
      </h2>

      <div className="flex flex-col gap-4">
        {reviews.map((rev, idx) => (
          <div
            key={rev.id}
            className={`pb-4 ${idx !== reviews.length - 1 ? 'border-b border-outline-variant' : ''}`}
          >
            <div className="flex items-center gap-1 mb-1 text-primary">
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
            <p className="text-sm text-on-surface-variant italic">
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
