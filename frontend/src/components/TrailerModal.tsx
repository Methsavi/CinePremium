import React, { useEffect, useMemo, useState } from 'react';
import { X, ExternalLink, Play, Film } from 'lucide-react';

interface TrailerModalProps {
  trailerUrl: string | null;
  movieTitle?: string;
  onClose: () => void;
}

/**
 * Extracts YouTube Video ID from any format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Plain VIDEO_ID (11 chars)
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If already an 11-char alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Standard YouTube patterns
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  trailerUrl,
  movieTitle,
  onClose
}) => {
  const [iframeLoading, setIframeLoading] = useState(true);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Compute final YouTube embed URL
  const { embedUrl, externalUrl } = useMemo(() => {
    if (!trailerUrl) {
      if (movieTitle) {
        // Search fallback
        const query = encodeURIComponent(`${movieTitle} official trailer`);
        return {
          embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${query}&autoplay=1`,
          externalUrl: `https://www.youtube.com/results?search_query=${query}`
        };
      }
      return { embedUrl: '', externalUrl: '' };
    }

    const videoId = extractYouTubeId(trailerUrl);

    if (videoId) {
      return {
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`,
        externalUrl: `https://www.youtube.com/watch?v=${videoId}`
      };
    }

    // If it's already an embed link or custom video link
    if (trailerUrl.includes('embed') || trailerUrl.startsWith('http')) {
      const glue = trailerUrl.includes('?') ? '&' : '?';
      return {
        embedUrl: `${trailerUrl}${glue}autoplay=1`,
        externalUrl: trailerUrl
      };
    }

    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${trailerUrl}?autoplay=1`,
      externalUrl: `https://www.youtube.com/watch?v=${trailerUrl}`
    };
  }, [trailerUrl, movieTitle]);

  if (!trailerUrl && !movieTitle) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-[#0c1324] rounded-3xl border border-[#2e3447] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header Bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#151b2d] border-b border-[#2e3447]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30 shrink-0">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate font-display">
                {movieTitle ? `${movieTitle} — Official Trailer` : 'Official Movie Trailer'}
              </h3>
              <p className="text-[10px] text-[#908fa0] flex items-center gap-1">
                <Film className="w-3 h-3 text-primary" />
                <span>CinePremium 4K Laser Cinema Preview</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Watch on YouTube"
                className="p-2 text-[#908fa0] hover:text-white hover:bg-[#2e3447] rounded-xl transition-all flex items-center gap-1 text-xs"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open in YouTube</span>
              </a>
            )}

            <button
              onClick={onClose}
              title="Close Trailer (Esc)"
              className="p-2 text-[#908fa0] hover:text-white hover:bg-rose-600 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 16:9 Cinematic Video Container ── */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white z-0">
              <div className="w-10 h-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-400">Loading High-Definition Trailer...</span>
            </div>
          )}

          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={movieTitle || 'Movie Trailer'}
              className="w-full h-full border-0 relative z-10"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIframeLoading(false)}
            />
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <p className="text-sm">Trailer is currently being prepared by the studio.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
