import React from 'react';
import { Movie, Cinema, Showtime, Seat } from '../types/movie';
import { X, Ticket, QrCode, Calendar, MapPin, Trash2 } from 'lucide-react';

export interface BookingRecord {
  id: string;
  movie: Movie;
  cinema: Cinema;
  date: string;
  showtime: Showtime;
  seats: Seat[];
  totalAmount: number;
}

interface MyTicketsModalProps {
  bookings: BookingRecord[];
  onClose: () => void;
  onCancelBooking: (id: string) => void;
}

export const MyTicketsModal: React.FC<MyTicketsModalProps> = ({
  bookings,
  onClose,
  onCancelBooking
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-2 text-amber-400">
            <Ticket className="w-6 h-6" />
            <h3 className="text-xl font-bold text-white">My Movie Tickets</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-red-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-lg font-bold text-slate-300">No Tickets Booked Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our now showing movies and book your first tickets today!
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-950 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={booking.movie.posterUrl}
                    alt={booking.movie.title}
                    className="w-16 h-24 object-cover rounded-xl border border-white/10 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-300 text-[10px] font-bold uppercase">
                      Confirmed
                    </span>
                    <h4 className="font-bold text-white text-lg">{booking.movie.title}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      {booking.cinema.name}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {booking.date} at {booking.showtime.time} ({booking.showtime.format})
                    </p>
                    <p className="text-xs text-slate-300 font-semibold pt-1">
                      Seats: {booking.seats.map(s => s.id).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-white/10 gap-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-10 h-10 text-white bg-white/10 p-1 rounded" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">ID: {booking.id}</span>
                      <span className="text-base font-black text-emerald-400">Rs. {booking.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onCancelBooking(booking.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancel Ticket</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
