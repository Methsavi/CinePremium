import React, { useState } from 'react';
import { Cinema } from '@/types/movie';
import { CINEMAS } from '@/data/movies';
import { Clock } from 'lucide-react';

interface MovieShowtimesProps {
  onSelectShowtime: (cinema: Cinema, showtimeId: string) => void;
}

const DATES = [
  { label: 'Today', dayNum: '14', active: true },
  { label: 'Fri', dayNum: '15', active: false },
  { label: 'Sat', dayNum: '16', active: false },
];

export const MovieShowtimes: React.FC<MovieShowtimesProps> = ({ onSelectShowtime }) => {
  const [selectedDate, setSelectedDate] = useState('14');

  return (
    <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant flex flex-col gap-4">
      <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        <span>Showtimes</span>
      </h2>

      {/* Date Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-outline-variant">
        {DATES.map((d) => (
          <button
            key={d.dayNum}
            onClick={() => setSelectedDate(d.dayNum)}
            className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] border transition-colors ${
              selectedDate === d.dayNum
                ? 'bg-surface-variant border-primary text-primary font-bold'
                : 'bg-surface text-on-surface-variant border-transparent hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="text-xs uppercase font-medium">{d.label}</span>
            <span className="text-lg font-bold">{d.dayNum}</span>
          </button>
        ))}
      </div>

      {/* Cinema Locations */}
      <div className="flex flex-col gap-4 mt-1">
        {CINEMAS.map((cinema) => (
          <div key={cinema.id} className="space-y-2">
            <h3 className="text-sm font-semibold text-on-surface">{cinema.name}</h3>
            <div className="flex flex-wrap gap-2">
              {cinema.showtimes.map((st) => (
                <button
                  key={st.id}
                  onClick={() => onSelectShowtime(cinema, st.id)}
                  className="px-3 py-1.5 rounded bg-surface border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors text-xs font-semibold flex flex-col items-center"
                >
                  <span>{st.time}</span>
                  <span className="text-[10px] opacity-70 uppercase">{st.format}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
