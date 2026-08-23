import React, { useState, useMemo } from 'react';
import { Showtime } from '../../../types/showtime';
import { Movie } from '../../../types/movie';

interface LineChartAnalyticsProps {
  showtimes?: Showtime[];
  movies?: Movie[];
}

interface DualDataPoint {
  day: string;
  shortDay: string;
  series1: number; // e.g. Screenings / Translations
  series2: number; // e.g. Bookings / Sessions
}

export const LineChartAnalytics: React.FC<LineChartAnalyticsProps> = ({ 
  showtimes = []
}) => {
  // Active hovered point (default to Wed / index 2 like in screenshot)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(2);

  // 7 days trend data
  const data: DualDataPoint[] = useMemo(() => {
    const days = [
      { day: 'Monday', shortDay: 'Mon', s1: 150, s2: 80 },
      { day: 'Tuesday', shortDay: 'Tue', s1: 230, s2: 120 },
      { day: 'Wednesday', shortDay: 'Wed', s1: 180, s2: 150 },
      { day: 'Thursday', shortDay: 'Thu', s1: 290, s2: 170 },
      { day: 'Friday', shortDay: 'Fri', s1: 210, s2: 160 },
      { day: 'Saturday', shortDay: 'Sat', s1: 340, s2: 220 },
      { day: 'Sunday', shortDay: 'Sun', s1: 400, s2: 270 },
    ];

    // Scale slightly with dynamic showtimes/movies count if available
    const baseMult = showtimes.length > 0 ? Math.max(1, showtimes.length / 4) : 1;

    return days.map(d => ({
      day: d.day,
      shortDay: d.shortDay,
      series1: Math.round(d.s1 * baseMult),
      series2: Math.round(d.s2 * baseMult),
    }));
  }, [showtimes.length]);

  const chartWidth = 650;
  const chartHeight = 280;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 35;
  const paddingBottom = 35;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = useMemo(() => {
    const rawMax = Math.max(...data.map(d => Math.max(d.series1, d.series2)));
    return Math.ceil((rawMax * 1.15) / 100) * 100 || 400;
  }, [data]);

  // Generate Bezier path points
  const points1 = useMemo(() => {
    return data.map((d, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * innerWidth;
      const y = paddingTop + innerHeight - (d.series1 / maxVal) * innerHeight;
      return { x, y, value: d.series1, day: d.day, shortDay: d.shortDay };
    });
  }, [data, maxVal, innerWidth, innerHeight, paddingLeft, paddingTop]);

  const points2 = useMemo(() => {
    return data.map((d, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * innerWidth;
      const y = paddingTop + innerHeight - (d.series2 / maxVal) * innerHeight;
      return { x, y, value: d.series2, day: d.day, shortDay: d.shortDay };
    });
  }, [data, maxVal, innerWidth, innerHeight, paddingLeft, paddingTop]);

  const getCurvedPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const controlX1 = p0.x + (p1.x - p0.x) * 0.45;
      const controlY1 = p0.y;
      const controlX2 = p0.x + (p1.x - p0.x) * 0.55;
      const controlY2 = p1.y;
      d += ` C ${controlX1},${controlY1} ${controlX2},${controlY2} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const pathD1 = useMemo(() => getCurvedPath(points1), [points1]);
  const pathD2 = useMemo(() => getCurvedPath(points2), [points2]);

  const areaD1 = useMemo(() => {
    if (!pathD1 || points1.length === 0) return '';
    const lastX = points1[points1.length - 1].x;
    const firstX = points1[0].x;
    const bottomY = paddingTop + innerHeight;
    return `${pathD1} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [pathD1, points1, paddingTop, innerHeight]);

  const areaD2 = useMemo(() => {
    if (!pathD2 || points2.length === 0) return '';
    const lastX = points2[points2.length - 1].x;
    const firstX = points2[0].x;
    const bottomY = paddingTop + innerHeight;
    return `${pathD2} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [pathD2, points2, paddingTop, innerHeight]);

  const yTicks = [400, 300, 200, 100, 0];

  const activeIndex = hoveredIndex ?? 2;
  const activePt1 = points1[activeIndex];
  const activePt2 = points2[activeIndex];

  return (
    <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
      
      {/* Top Legend Pill matching the screenshot */}
      <div className="flex items-center justify-end">
        <div className="inline-flex items-center gap-3 bg-zinc-900/90 border border-white/10 rounded-full px-3.5 py-1.5 text-xs shadow-inner">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e50914] shadow-[0_0_8px_rgba(229,9,20,0.7)]" />
            <span className="text-zinc-300 font-medium text-[11px]">Screenings</span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <span className="text-zinc-300 font-medium text-[11px]">Bookings</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-visible mt-2">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-56 sm:h-64 overflow-visible"
        >
          <defs>
            {/* Gradient 1 (Crimson Red Glow) */}
            <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e50914" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#e50914" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#e50914" stopOpacity="0" />
            </linearGradient>

            {/* Gradient 2 (Emerald Green Glow) */}
            <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="80%" stopColor="#10b981" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="lineGrad1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff4d5a" />
              <stop offset="100%" stopColor="#e50914" />
            </linearGradient>

            <linearGradient id="lineGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Dotted Gridlines & Minimal Y-Labels */}
          {yTicks.map((val) => {
            const y = paddingTop + innerHeight - (val / 400) * innerHeight;
            if (val === 0) return null; // Don't draw baseline label clutter
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#27272a"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <text
                  x={paddingLeft - 12}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#71717a"
                  fontSize="11"
                  fontWeight="500"
                  fontFamily="sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area 1 */}
          {areaD1 && <path d={areaD1} fill="url(#areaGrad1)" />}

          {/* Area 2 */}
          {areaD2 && <path d={areaD2} fill="url(#areaGrad2)" />}

          {/* Smooth Line 1 */}
          {pathD1 && (
            <path
              d={pathD1}
              fill="none"
              stroke="url(#lineGrad1)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Smooth Line 2 */}
          {pathD2 && (
            <path
              d={pathD2}
              fill="none"
              stroke="url(#lineGrad2)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Vertical Dotted Cursor Line */}
          {activePt1 && (
            <line
              x1={activePt1.x}
              y1={paddingTop - 10}
              x2={activePt1.x}
              y2={paddingTop + innerHeight}
              stroke="#52525b"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              opacity="0.7"
            />
          )}

          {/* Active Node 1 Dot */}
          {activePt1 && (
            <circle
              cx={activePt1.x}
              cy={activePt1.y}
              r="4.5"
              fill="#ffffff"
              stroke="#e50914"
              strokeWidth="3"
            />
          )}

          {/* Active Node 2 Dot */}
          {activePt2 && (
            <circle
              cx={activePt2.x}
              cy={activePt2.y}
              r="4.5"
              fill="#ffffff"
              stroke="#10b981"
              strokeWidth="3"
            />
          )}

          {/* Invisible Click/Hover capture zones across columns */}
          {points1.map((p, idx) => (
            <rect
              key={idx}
              x={p.x - (innerWidth / (data.length - 1)) / 2}
              y={paddingTop - 20}
              width={innerWidth / (data.length - 1)}
              height={innerHeight + 40}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
            />
          ))}
        </svg>

        {/* Floating Tooltip Card matching the screenshot style */}
        {activePt1 && activePt2 && (
          <div 
            className="absolute z-20 bg-zinc-950/90 backdrop-blur-xl border border-white/15 rounded-xl p-3.5 shadow-2xl space-y-2 pointer-events-none transition-all duration-150"
            style={{
              left: `${(activePt1.x / chartWidth) * 100}%`,
              top: `${Math.min(70, Math.max(20, (activePt2.y / chartHeight) * 100))}%`,
              transform: activeIndex > 3 ? 'translate(-105%, -20%)' : 'translate(10px, -20%)',
              minWidth: '135px'
            }}
          >
            <div className="text-xs font-bold text-white tracking-wide">
              {data[activeIndex].shortDay}
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#e50914]" />
                  <span className="text-zinc-400 text-[11px]">Screenings</span>
                </div>
                <span className="font-bold text-white font-mono">{activePt1.value}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="text-zinc-400 text-[11px]">Bookings</span>
                </div>
                <span className="font-bold text-white font-mono">{activePt2.value}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default LineChartAnalytics;
