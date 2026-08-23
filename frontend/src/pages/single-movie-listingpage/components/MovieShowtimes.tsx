import React, { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';
import { getShowtimes } from '@/services/showtimeApi';
import { getHalls } from '@/services/hallApi';
import { Showtime } from '@/types/showtime';
import { CinemaHall } from '@/types/hall';
import { Clock, Calendar, Tv, Ticket, Armchair, ChevronRight, CheckCircle2, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface MovieShowtimesProps {
  movie: Movie;
  onSelectShowtime?: (showtimeData: any) => void;
}

const DATES = [
  { label: 'Today', dateStr: new Date().toISOString().split('T')[0], displayDate: 'Today' },
  { label: 'Tomorrow', dateStr: new Date(Date.now() + 86400000).toISOString().split('T')[0], displayDate: 'Tomorrow' },
  { label: 'Day 3', dateStr: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], displayDate: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
  { label: 'Day 4', dateStr: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], displayDate: new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) },
];

const DEFAULT_HALLS: CinemaHall[] = [
  {
    id: 'hall-imax',
    name: 'Hall 1 — IMAX Laser Experience',
    screenType: 'IMAX 3D',
    totalCapacity: 120,
    seatTiers: [
      { tierName: 'VIP Recliner', seatCount: 24, price: 22 },
      { tierName: 'Executive Club', seatCount: 48, price: 18 },
      { tierName: 'Standard', seatCount: 48, price: 14 }
    ],
    isActive: true,
    createdAt: ''
  },
  {
    id: 'hall-dolby',
    name: 'Hall 2 — Dolby Atmos Cinema',
    screenType: 'Dolby Cinema',
    totalCapacity: 96,
    seatTiers: [
      { tierName: 'VIP Recliner', seatCount: 20, price: 20 },
      { tierName: 'Standard', seatCount: 76, price: 15 }
    ],
    isActive: true,
    createdAt: ''
  }
];

const DEFAULT_TIME_SLOTS = ['11:30 AM', '02:45 PM', '06:15 PM', '09:30 PM'];

export const MovieShowtimes: React.FC<MovieShowtimesProps> = ({ movie }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>(DATES[0].dateStr);
  const [halls, setHalls] = useState<CinemaHall[]>(DEFAULT_HALLS);
  const [dbShowtimes, setDbShowtimes] = useState<Showtime[]>([]);
  const [selectedHallId, setSelectedHallId] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hallsData, showtimesData] = await Promise.all([
          getHalls(),
          getShowtimes()
        ]);
        if (hallsData && hallsData.length > 0) {
          setHalls(hallsData);
          setSelectedHallId(hallsData[0].id);
        } else {
          setSelectedHallId(DEFAULT_HALLS[0].id);
        }

        if (showtimesData && showtimesData.length > 0) {
          // Filter showtimes for current movie if assigned
          const movieShowtimes = showtimesData.filter((st: any) => {
            const mId = typeof st.movie === 'object' ? st.movie?.id || st.movie?._id : st.movie;
            return mId === movie.id || st.movie?.title?.toLowerCase() === movie.title.toLowerCase();
          });
          setDbShowtimes(movieShowtimes.length > 0 ? movieShowtimes : showtimesData);
        }
      } catch (err) {
        console.warn('Could not fetch showtimes from database API:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movie.id, movie.title]);

  const selectedHall = halls.find((h) => h.id === selectedHallId) || halls[0];

  // Determine available time slots for the selected hall
  const availableShowtimesForHall = dbShowtimes.filter((st: any) => {
    const hId = typeof st.hall === 'object' ? st.hall?.id || st.hall?._id : st.hall;
    return hId === selectedHall?.id && (!st.showDate || st.showDate === selectedDate);
  });

  const timeSlots = availableShowtimesForHall.length > 0
    ? availableShowtimesForHall.map((st) => st.showTime)
    : DEFAULT_TIME_SLOTS;

  // Auto-select first time slot if none selected
  useEffect(() => {
    if (timeSlots.length > 0 && (!selectedTime || !timeSlots.includes(selectedTime))) {
      setSelectedTime(timeSlots[0]);
    }
  }, [selectedHallId, selectedDate, timeSlots]);

  const handleProceedToSeats = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/movie/${movie.id}` } });
      return;
    }

    const matchedShowtime = availableShowtimesForHall.find(st => st.showTime === selectedTime) || dbShowtimes[0];

    navigate('/seat-selection', {
      state: {
        movie,
        hall: selectedHall,
        showtimeId: matchedShowtime?.id || `st-${movie.id}-${selectedHall?.id}`,
        showDate: selectedDate,
        showTime: selectedTime,
        format: matchedShowtime?.format || selectedHall?.screenType || 'Standard 2D',
        tierPrices: matchedShowtime?.tierPrices || selectedHall?.seatTiers || [
          { tierName: 'VIP Recliner', price: 22 },
          { tierName: 'Standard', price: 15 }
        ]
      }
    });
  };

  return (
    <div id="showtimes-section" className="bg-[#151b2d] rounded-3xl p-6 border border-[#2e3447] shadow-xl flex flex-col gap-5 space-y-2 scroll-mt-24">
      <div className="flex items-center justify-between border-b border-[#2e3447] pb-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
          <Clock className="w-5 h-5 text-primary" />
          <span>Showtimes & Cinema Halls</span>
        </h2>
        <span className="text-xs text-[#c0c1ff] font-semibold bg-[#0c1324] px-3 py-1 rounded-full border border-[#2e3447]">
          Live Auditorium Booking
        </span>
      </div>

      {/* ── 1. Date Selector ── */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#908fa0] uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>1. Select Screening Date</span>
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {DATES.map((d) => (
            <button
              key={d.dateStr}
              onClick={() => setSelectedDate(d.dateStr)}
              className={`flex flex-col items-center py-2 px-3.5 rounded-xl min-w-[75px] border transition-all cursor-pointer ${
                selectedDate === d.dateStr
                  ? 'bg-primary text-white border-primary shadow-[0_0_12px_rgba(229,9,20,0.3)] font-bold scale-102'
                  : 'bg-[#0c1324] text-on-surface-variant border-[#2e3447] hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-tight">{d.displayDate}</span>
              <span className="text-xs opacity-80">{d.dateStr.slice(-5)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Cinema Hall & Format Selector ── */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#908fa0] uppercase tracking-wider flex items-center gap-1.5">
          <Tv className="w-3.5 h-3.5 text-primary" />
          <span>2. Select Cinema Hall & Auditorium</span>
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {halls.map((hall) => {
            const isSelected = hall.id === selectedHall?.id;
            return (
              <button
                key={hall.id}
                onClick={() => {
                  setSelectedHallId(hall.id);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-sm'
                    : 'bg-[#0c1324] border-[#2e3447] hover:border-white/20'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">{hall.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#c0c1ff]/15 text-[#c0c1ff] border border-[#c0c1ff]/30 text-[10px] font-extrabold uppercase">
                      {hall.screenType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#908fa0]">
                    <Armchair className="w-3 h-3 text-[#c0c1ff]" />
                    <span>{hall.totalCapacity || 100} Total Seats</span>
                    {hall.seatTiers && hall.seatTiers.length > 0 && (
                      <span>· {hall.seatTiers.map(t => t.tierName).join(' & ')}</span>
                    )}
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#908fa0] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Time Slots ── */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#908fa0] uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>3. Select Showtime Slot</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {timeSlots.map((time) => {
            const isSelected = selectedTime === time;
            return (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.35)] scale-102'
                    : 'bg-[#0c1324] text-white border-[#2e3447] hover:border-amber-400/50'
                }`}
              >
                <span>{time}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tier Prices Preview ── */}
      {selectedHall?.seatTiers && selectedHall.seatTiers.length > 0 && (
        <div className="p-3 bg-[#0c1324] rounded-2xl border border-[#2e3447] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[#908fa0] font-semibold flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5 text-emerald-400" />
            Pricing:
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedHall.seatTiers.map((tier) => (
              <span
                key={tier.tierName}
                className="px-2.5 py-1 rounded-lg bg-[#151b2d] border border-[#2e3447] text-[11px] text-[#dce1fb] font-medium"
              >
                {tier.tierName}: <strong className="text-emerald-400">Rs. {Number(tier.price || 15).toFixed(2)}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Proceed to Seats Button ── */}
      <button
        onClick={handleProceedToSeats}
        className="liquid-glow-btn w-full text-surface-container-lowest font-black text-sm sm:text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-2xl cursor-pointer hover:scale-102 transition-all mt-2"
      >
        <Armchair className="w-5 h-5 fill-current" />
        <span>Select Available Seats ({selectedTime || 'Pick Slot'})</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MovieShowtimes;
