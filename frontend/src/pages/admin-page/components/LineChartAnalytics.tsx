import React, { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

interface LineChartAnalyticsProps {
  bookings?: any[];
  showtimes?: any[];
  movies?: any[];
}

interface BookingDataPoint {
  day: string;
  shortDay: string;
  bookings: number;
}

export const LineChartAnalytics: React.FC<LineChartAnalyticsProps> = ({ 
  bookings = []
}) => {
  // Active hovered point (default to middle/Wednesday)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(2);

  // 7 days real database booking growth trend
  const data: BookingDataPoint[] = useMemo(() => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const shortNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Real counts mapped Monday=0 ... Sunday=6
    const dayBookings = [0, 0, 0, 0, 0, 0, 0];

    // Compute real ticket reservations per day from database bookings
    bookings.forEach((bk) => {
      const dateStr = bk.date || bk.createdAt;
      if (dateStr) {
        const parts = typeof dateStr === 'string' ? dateStr.split('T')[0].split('-') : [];
        let d: Date;
        if (parts.length === 3) {
          d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          d = new Date(dateStr);
        }
        if (!isNaN(d.getTime())) {
          const jsDay = d.getDay(); // 0 is Sunday
          const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
          const seatCount = Array.isArray(bk.seats) ? bk.seats.length : 1;
          dayBookings[dayIdx] += seatCount;
        }
      }
    });

    return dayNames.map((dayName, index) => ({
      day: dayName,
      shortDay: shortNames[index],
      bookings: dayBookings[index],
    }));
  }, [bookings]);

  const totalBookings = useMemo(() => {
    return data.reduce((acc, d) => acc + d.bookings, 0);
  }, [data]);

  const chartWidth = 650;
  const chartHeight = 270;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 35;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = useMemo(() => {
    const rawMax = Math.max(...data.map(d => d.bookings), 1);
    if (rawMax <= 5) return 6;
    if (rawMax <= 10) return 12;
    if (rawMax <= 20) return 24;
    if (rawMax <= 50) return 60;
    if (rawMax <= 100) return 120;
    return Math.ceil((rawMax * 1.2) / 10) * 10;
  }, [data]);

  // Generate Bezier path points
  const points = useMemo(() => {
    return data.map((d, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * innerWidth;
      const y = paddingTop + innerHeight - (d.bookings / maxVal) * innerHeight;
      return { x, y, value: d.bookings, day: d.day, shortDay: d.shortDay };
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

  const pathD = useMemo(() => getCurvedPath(points), [points]);

  const areaD = useMemo(() => {
    if (!pathD || points.length === 0) return '';
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const bottomY = paddingTop + innerHeight;
    return `${pathD} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [pathD, points, paddingTop, innerHeight]);

  const yTicks = useMemo(() => {
    return [
      maxVal,
      Math.round(maxVal * 0.75),
      Math.round(maxVal * 0.5),
      Math.round(maxVal * 0.25),
      0
    ];
  }, [maxVal]);

  const activeIndex = hoveredIndex ?? 2;
  const activePt = points[activeIndex];

  return (
    <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
      
      {/* Top Header Bar with Live Badge */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Booking Growth
            </h4>
            <span className="text-[10px] text-zinc-400">
              Live weekly customer reservations from database
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
          <span className="text-emerald-300 font-bold text-[11px]">
            {totalBookings} Total Ticket{totalBookings === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-visible mt-2">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-56 sm:h-64 overflow-visible"
        >
          <defs>
            {/* Emerald Green Area Glow */}
            <linearGradient id="bookingAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
              <stop offset="75%" stopColor="#10b981" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>

            {/* Glowing Stroke Line */}
            <linearGradient id="bookingLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Dotted Gridlines & Y-Labels */}
          {yTicks.map((val) => {
            const y = paddingTop + innerHeight - (val / maxVal) * innerHeight;
            if (val === 0) return null;
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

          {/* Glowing Area Fill */}
          {areaD && <path d={areaD} fill="url(#bookingAreaGrad)" />}

          {/* Smooth Booking Growth Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#bookingLineGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(16,185,129,0.4))'
              }}
            />
          )}

          {/* Vertical Dotted Cursor Guide */}
          {activePt && (
            <line
              x1={activePt.x}
              y1={paddingTop - 5}
              x2={activePt.x}
              y2={paddingTop + innerHeight}
              stroke="#52525b"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              opacity="0.7"
            />
          )}

          {/* Active Node Dot */}
          {activePt && (
            <circle
              cx={activePt.x}
              cy={activePt.y}
              r="5"
              fill="#ffffff"
              stroke="#10b981"
              strokeWidth="3.5"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.9))'
              }}
            />
          )}

          {/* X-Axis Days Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={paddingTop + innerHeight + 22}
              textAnchor="middle"
              fill={idx === activeIndex ? "#ffffff" : "#71717a"}
              fontSize="11"
              fontWeight={idx === activeIndex ? "700" : "500"}
              fontFamily="sans-serif"
            >
              {p.shortDay}
            </text>
          ))}

          {/* Invisible Hover capture zones */}
          {points.map((p, idx) => (
            <rect
              key={idx}
              x={p.x - (innerWidth / (data.length - 1)) / 2}
              y={paddingTop - 20}
              width={innerWidth / (data.length - 1)}
              height={innerHeight + 45}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
            />
          ))}
        </svg>

        {/* Floating Tooltip Card */}
        {activePt && (
          <div 
            className="absolute z-20 bg-zinc-950/95 backdrop-blur-xl border border-white/15 rounded-xl p-3 shadow-2xl space-y-1.5 pointer-events-none transition-all duration-150"
            style={{
              left: `${(activePt.x / chartWidth) * 100}%`,
              top: `${Math.min(65, Math.max(15, (activePt.y / chartHeight) * 100))}%`,
              transform: activeIndex > 3 ? 'translate(-105%, -20%)' : 'translate(10px, -20%)',
              minWidth: '130px'
            }}
          >
            <div className="text-xs font-bold text-white tracking-wide">
              {data[activeIndex].day}
            </div>

            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span className="text-zinc-400 text-[11px]">Bookings</span>
              </div>
              <span className="font-bold text-emerald-400 font-mono">
                {activePt.value} {activePt.value === 1 ? 'ticket' : 'tickets'}
              </span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default LineChartAnalytics;
