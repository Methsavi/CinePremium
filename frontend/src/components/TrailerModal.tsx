import React from 'react';
import { X } from 'lucide-react';

interface TrailerModalProps {
  trailerUrl: string | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ trailerUrl, onClose }) => {
  if (!trailerUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white hover:bg-red-600 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Frame */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`${trailerUrl}?autoplay=1`}
            title="Movie Trailer"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};
