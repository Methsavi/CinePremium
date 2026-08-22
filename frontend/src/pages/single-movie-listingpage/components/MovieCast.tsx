import React from 'react';
import { CastMember } from '@/types/movie';
import { Users } from 'lucide-react';

interface MovieCastProps {
  castMembers?: CastMember[];
}

export const MovieCast: React.FC<MovieCastProps> = ({ castMembers = [] }) => {
  if (castMembers.length === 0) return null;

  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant space-y-4">
      <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <span>Cast & Crew</span>
      </h2>

      <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
        {castMembers.map((member) => (
          <div key={member.id} className="flex flex-col items-center gap-2 min-w-[100px] snap-start">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-surface-variant shadow-md">
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-semibold text-on-surface text-center line-clamp-1">
              {member.name}
            </span>
            <span className="text-xs text-on-surface-variant text-center line-clamp-1">
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
