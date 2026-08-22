import React from 'react';

interface MovieSynopsisProps {
  synopsis: string;
}

export const MovieSynopsis: React.FC<MovieSynopsisProps> = ({ synopsis }) => {
  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant space-y-3">
      <h2 className="text-xl font-bold text-on-surface">Synopsis</h2>
      <p className="text-base text-on-surface-variant leading-relaxed">
        {synopsis}
      </p>
    </div>
  );
};
