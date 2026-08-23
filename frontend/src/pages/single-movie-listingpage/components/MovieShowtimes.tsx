import React, { useState, useEffect, useMemo } from 'react';
import { Movie } from '@/types/movie';
import { getShowtimes } from '@/services/showtimeApi';
import { getHalls } from '@/services/hallApi';
import { Showtime } from '@/types/showtime';
import { CinemaHall } from '@/types/hall';
import { 
  Eye, 
  MapPin, 
  ChevronDown, 
  Clock, 
  Sparkles,
  ChevronRight,
  Ticket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface MovieShowtimesProps {
  movie: Movie;
  onSelectShowtime?: (showtimeData: any) => void;
}

// Generate the upcoming 7 calendar days
const getUpcomingDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getTime() + i * 86400000);
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toISOString().split('T')[0];
    days.push({ month, dayNum, dayLabel, dateStr });
  }
  return days;
};

export const MovieShowtimes: React.FC<MovieShowtimesProps> = ({ movie }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const calendarDays = useMemo(() => getUpcomingDays(), []);
  const [selectedDate, setSelectedDate] = useState<string>(calendarDays[0].dateStr);

  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [dbShowtimes, setDbShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedExperience, setSelectedExperience] = useState<string>('ALL EXPERIENCES');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL LOCATIONS');
  const [isExperienceDropdownOpen, setIsExperienceDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hallsData, showtimesData] = await Promise.all([
          getHalls().catch(() => [] as CinemaHall[]),
          getShowtimes().catch(() => [] as Showtime[])
        ]);

        setHalls(hallsData || []);

        if (showtimesData && showtimesData.length > 0) {
          const movieShowtimes = showtimesData.filter((st: any) => {
            const mId = typeof st.movie === 'object' ? st.movie?.id || st.movie?._id : st.movie;
            return mId === movie.id || st.movie?.title?.toLowerCase() === movie.title.toLowerCase();
          });
          setDbShowtimes(movieShowtimes.length > 0 ? movieShowtimes : showtimesData);
        } else {
          setDbShowtimes([]);
        }
      } catch (err) {
        console.error('Could not fetch showtimes from database API:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movie.id, movie.title]);

  // Distinct experiences from halls
  const experiencesList = useMemo(() => {
    const set = new Set<string>();
    halls.forEach((h) => {
      if (h.screenType) set.add(h.screenType.toUpperCase());
    });
    return ['ALL EXPERIENCES', ...Array.from(set)];
  }, [halls]);

  const locationsList = ['ALL LOCATIONS', 'COLOMBO CITY CENTRE', 'HAVELOCK CITY MALL', 'KANDY CITY CENTRE'];

  // Group halls and showtimes
  const filteredHalls = useMemo(() => {
    return halls.filter((hall) => {
      if (selectedExperience !== 'ALL EXPERIENCES') {
        if (hall.screenType?.toUpperCase() !== selectedExperience) return false;
      }
      return true;
    });
  }, [halls, selectedExperience]);

  const handleShowtimeClick = (hall: CinemaHall, showtimeSlot: string, showtimeObj?: Showtime) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/movie/${movie.id}` } });
      return;
    }

    navigate('/seat-selection', {
      state: {
        movie,
        hall,
        showtimeId: showtimeObj?.id || `st-${movie.id}-${hall.id}`,
        showDate: selectedDate,
        showTime: showtimeSlot,
        format: showtimeObj?.format || hall.screenType || 'Standard 2D',
        tierPrices: showtimeObj?.tierPrices || hall.seatTiers || [
          { tierName: 'VIP Recliner', price: 22 },
          { tierName: 'Standard', price: 15 }
        ]
      }
    });
  };

  return (
    <div id="showtimes-section" className="w-full space-y-6 scroll-mt-24 font-sans text-white">

      {/* ── 1. DATE & FILTER BAR ── */}
      <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xl">
        
        {/* Date Selector Cards */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {calendarDays.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                className={`flex flex-col items-center justify-center min-w-[62px] sm:min-w-[70px] h-[72px] sm:h-[78px] rounded-xl transition-all cursor-pointer font-bold ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-[0_0_16px_rgba(229,9,20,0.6)] scale-102 border border-red-500'
                    : 'bg-zinc-950 text-zinc-300 border border-white/10 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">{d.month}</span>
                <span className="text-lg sm:text-xl font-black leading-tight my-0.5">{d.dayNum}</span>
                <span className="text-[10px] font-semibold opacity-85">{d.dayLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Dropdowns (All Experiences, All Locations) */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          
          {/* Experience Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <button
              onClick={() => {
                setIsExperienceDropdownOpen(!isExperienceDropdownOpen);
                setIsLocationDropdownOpen(false);
              }}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 hover:border-white/30 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="truncate">{selectedExperience}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isExperienceDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExperienceDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-zinc-950 border border-white/15 rounded-xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                {experiencesList.map((exp) => (
                  <button
                    key={exp}
                    onClick={() => {
                      setSelectedExperience(exp);
                      setIsExperienceDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedExperience === exp
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <button
              onClick={() => {
                setIsLocationDropdownOpen(!isLocationDropdownOpen);
                setIsExperienceDropdownOpen(false);
              }}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 hover:border-white/30 text-xs font-bold text-zinc-200 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="truncate">{selectedLocation}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLocationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-950 border border-white/15 rounded-xl shadow-2xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                {locationsList.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setIsLocationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedLocation === loc
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ── 3. CINEMA EXPERIENCES & SHOWTIME SLOTS ── */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-16 text-center text-zinc-400 bg-[#0d0d10] rounded-2xl border border-white/10">
            <Clock className="w-8 h-8 animate-spin text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">Loading live screening showtimes...</p>
          </div>
        ) : filteredHalls.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 bg-[#0d0d10] rounded-2xl border border-white/10 space-y-2">
            <p className="text-sm font-bold text-white">No showtimes found for the selected filter.</p>
            <p className="text-xs text-zinc-400">Try selecting "ALL EXPERIENCES" or another date.</p>
          </div>
        ) : (
          filteredHalls.map((hall) => {
            // Find showtimes for this hall on selected date
            const hallShowtimes = dbShowtimes.filter((st: any) => {
              const hId = typeof st.hall === 'object' ? st.hall?.id || st.hall?._id : st.hall;
              return hId === hall.id && (!st.showDate || st.showDate === selectedDate);
            });

            // Default standard time slots if database showtimes aren't populated for this date
            const displaySlots = hallShowtimes.length > 0
              ? hallShowtimes
              : [
                  { id: `slot-1-${hall.id}`, showTime: '09:45 AM', format: hall.screenType || '3D', isPast: true },
                  { id: `slot-2-${hall.id}`, showTime: '12:45 PM', format: hall.screenType || '3D', isPast: false },
                  { id: `slot-3-${hall.id}`, showTime: '03:40 PM', format: hall.screenType || '3D', isPast: false },
                  { id: `slot-4-${hall.id}`, showTime: '06:35 PM', format: hall.screenType || '3D', isPast: false },
                  { id: `slot-5-${hall.id}`, showTime: '10:30 PM', format: hall.screenType || '3D', isPast: false },
                ];

            const formatLabel = (hall.screenType || 'DIGITAL 3D').toUpperCase();

            return (
              <div key={hall.id} className="space-y-3">
                {/* Cinema Hall Heading */}
                <h3 className="text-xs sm:text-sm font-black tracking-wider text-zinc-300 uppercase px-1">
                  CINEPREMIUM MULTIPLEX – {hall.name.toUpperCase()}
                </h3>

                {/* Experience Box (Like Scope Digital 3D box) */}
                <div className="bg-[#0d0d10] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-12 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                  
                  {/* Left: Screen Format Label */}
                  <div className="w-full md:w-48 shrink-0 text-center md:text-left">
                    <span className="font-display text-2xl sm:text-3xl font-black tracking-wider text-white uppercase">
                      {formatLabel}
                    </span>
                    <div className="text-[11px] text-zinc-400 font-medium mt-1">
                      {hall.totalCapacity || 120} Seats • {hall.seatTiers?.[0]?.tierName || 'VIP & Standard'}
                    </div>
                  </div>

                  {/* Right: Showtimes Grid */}
                  <div className="flex-1 flex flex-wrap items-center gap-3.5 justify-center md:justify-start w-full">
                    {displaySlots.map((st: any) => {
                      const isPast = st.isPast || false;
                      const timeString = st.showTime || '07:30 PM';
                      const badgeFormat = st.format ? st.format.replace(/^(DIGITAL|STANDARD|IMAX)\s*/i, '') || '3D' : '3D';

                      if (isPast) {
                        return (
                          <div
                            key={st.id}
                            className="bg-zinc-900/40 border border-white/5 rounded-xl py-3 px-6 text-center min-w-[130px] opacity-40 cursor-not-allowed select-none"
                            title="Screening time has passed"
                          >
                            <span className="block text-sm font-extrabold text-zinc-500">{timeString}</span>
                            <span className="block text-[10px] font-bold text-zinc-600 uppercase mt-0.5">{badgeFormat}</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={st.id}
                          onClick={() => handleShowtimeClick(hall, timeString, st)}
                          className="bg-zinc-950 border border-white/10 hover:border-red-600 hover:bg-red-600/15 rounded-xl py-3 px-6 text-center min-w-[130px] transition-all duration-200 cursor-pointer shadow-md group hover:scale-105"
                        >
                          <span className="block text-sm font-black text-white group-hover:text-white tracking-wide">
                            {timeString}
                          </span>
                          <span className="block text-[10px] font-bold text-zinc-400 group-hover:text-red-400 uppercase mt-0.5">
                            {badgeFormat}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default MovieShowtimes;
