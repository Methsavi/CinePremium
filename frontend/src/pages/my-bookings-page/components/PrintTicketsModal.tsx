import React, { useMemo } from 'react';
import { BookingDisplayItem } from '../MyBookingsPage';
import { BarcodeSVG } from './BarcodeSVG';
import { X, Printer, QrCode } from 'lucide-react';

interface PrintTicketsModalProps {
  booking: BookingDisplayItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedSeatTicket {
  ticketIndex: number;
  seatId: string;
  row: string;
  seatNum: string;
  price: number;
  screenName: string;
  barcodeNumber: string;
}

export const PrintTicketsModal: React.FC<PrintTicketsModalProps> = ({
  booking,
  isOpen,
  onClose
}) => {
  if (!isOpen || !booking) return null;

  // Break booking down into individual tickets per seat
  const individualTickets: ParsedSeatTicket[] = useMemo(() => {
    const rawSeats = booking.seats && booking.seats.length > 0 ? booking.seats : [{ id: 'GA-01' }];
    const count = rawSeats.length;
    const avgPrice = booking.totalAmount > 0 ? booking.totalAmount / count : 15;

    // Screen number / name extraction
    let screenName = '01';
    const screenMatch = booking.cinemaName?.match(/screen\s*(\d+)/i) || booking.cinemaName?.match(/hall\s*(\w+)/i);
    if (screenMatch) {
      screenName = screenMatch[1].padStart(2, '0');
    }

    return rawSeats.map((seatItem: any, idx: number) => {
      const sId = typeof seatItem === 'string' ? seatItem : seatItem.id || `A${idx + 1}`;
      
      // Parse row & number
      const rowMatch = sId.match(/^([A-Za-z]+)/);
      const numMatch = sId.match(/(\d+)$/);
      
      const row = rowMatch ? rowMatch[1].toUpperCase() : 'A';
      const seatNum = numMatch ? numMatch[1].padStart(2, '0') : String(idx + 1).padStart(2, '0');
      const seatPrice = seatItem.price || avgPrice;

      // Unique deterministic barcode string similar to reference: "X06138420082680826"
      const cleanBookingId = (booking.id || 'BK').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const barcodeNumber = `X${cleanBookingId.slice(-6)}${row}${seatNum}${String(idx + 1).padStart(2, '0')}${screenName}826`;

      return {
        ticketIndex: idx + 1,
        seatId: sId,
        row,
        seatNum,
        price: seatPrice,
        screenName,
        barcodeNumber
      };
    });
  }, [booking]);

  const handlePrint = () => {
    window.print();
  };

  // Formatted date (e.g., "22 Mar")
  const formattedDateLabel = useMemo(() => {
    if (!booking.date) return 'Today';
    try {
      const parts = booking.date.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      }
    } catch {}
    return booking.date;
  }, [booking.date]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-[#0d0d10] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* ── Modal Header (Screen Only) ── */}
        <div className="no-print flex items-center justify-between p-5 border-b border-white/10 bg-zinc-950/90">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Cinema Entry Tickets</span>
              <span className="text-xs font-bold text-emerald-400">
                ({individualTickets.length} {individualTickets.length === 1 ? 'Pass' : 'Passes'})
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              {booking.movieTitle} • Ref: <span className="font-mono text-zinc-300">{booking.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print All Tickets</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-red-600 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Modal Body / Printable Ticket Cards ── */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-[#09090b]">

          {/* Printable Ticket Container */}
          <div className="printable-ticket-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
            {individualTickets.map((ticket, index) => (
              <div
                key={ticket.seatId + index}
                className="w-full max-w-[320px] bg-white text-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 flex flex-col relative print-page-break select-none transition-transform hover:scale-[1.01]"
                style={{
                  filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))'
                }}
              >
                {/* ── Top Movie Image Banner ── */}
                <div className="relative h-44 w-full bg-zinc-900 overflow-hidden shrink-0">
                  <img
                    src={booking.posterUrl || booking.backdropUrl || '/placeholder.jpg'}
                    alt={booking.movieTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                  
                  {/* CinePremium Watermark Tag */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-[9px] font-black uppercase tracking-wider text-white">
                    CINEPREMIUM
                  </div>

                  {/* Individual Ticket Counter */}
                  <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                    PASS {ticket.ticketIndex} OF {individualTickets.length}
                  </div>
                </div>

                {/* ── Middle Ticket Body ── */}
                <div className="p-5 pb-4 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Category & Title */}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                      Movies • {booking.cinemaName}
                    </span>
                    <h4 className="text-xl font-black text-zinc-950 tracking-tight leading-tight line-clamp-2 mt-0.5">
                      {booking.movieTitle}
                    </h4>
                  </div>

                  {/* 3-Column Stats Grid: Screen, Row, Seat */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-zinc-100 text-center">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Screen</span>
                      <span className="text-base font-black text-zinc-900">{ticket.screenName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Row</span>
                      <span className="text-base font-black text-zinc-900">{ticket.row}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Seat</span>
                      <span className="text-base font-black text-red-600">{ticket.seatNum}</span>
                    </div>
                  </div>

                  {/* 3-Column Stats Grid: Price, Date, Time */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-zinc-100 text-center">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Price</span>
                      <span className="text-sm font-black text-zinc-900">Rs. {ticket.price.toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Date</span>
                      <span className="text-sm font-bold text-zinc-900">{formattedDateLabel}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Time</span>
                      <span className="text-sm font-bold text-zinc-900">{booking.showtimeTime}</span>
                    </div>
                  </div>
                </div>

                {/* ── Perforated Tear Line with Semicircle Notches ── */}
                <div className="relative w-full my-1 flex items-center justify-between">
                  {/* Left Notch */}
                  <div
                    className="w-6 h-6 rounded-full bg-[#09090b] -ml-3 z-10"
                    style={{
                      boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.1)'
                    }}
                  />

                  {/* Dashed Line */}
                  <div className="flex-1 border-t-2 border-dashed border-zinc-300 mx-2" />

                  {/* Right Notch */}
                  <div
                    className="w-6 h-6 rounded-full bg-[#09090b] -mr-3 z-10"
                    style={{
                      boxShadow: 'inset 2px 0 3px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>

                {/* ── Bottom Stub: Barcode & QR Verification ── */}
                <div className="p-5 pt-3 pb-5 bg-white space-y-3 shrink-0 flex flex-col items-center">
                  
                  {/* Authentic Barcode */}
                  <div className="w-full text-zinc-950">
                    <BarcodeSVG
                      code={ticket.barcodeNumber}
                      barColor="#18181b"
                      textColor="text-zinc-600"
                      className="w-full h-11"
                    />
                  </div>

                  {/* QR Code & Seat Verification */}
                  <div className="flex items-center justify-between w-full pt-2 border-t border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-zinc-100 rounded-lg border border-zinc-200">
                        <QrCode className="w-7 h-7 text-zinc-900" />
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] font-black uppercase text-zinc-400 block tracking-tight">Seat Pass</span>
                        <span className="text-xs font-black text-zinc-900">{ticket.seatId}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono text-zinc-500 block">Single Admission</span>
                      <span className="text-[10px] font-bold text-emerald-600">CONFIRMED</span>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>

        </div>

        {/* ── Modal Footer (Screen Only) ── */}
        <div className="no-print p-4 border-t border-white/10 bg-zinc-950 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Booking ID: <strong className="text-white font-mono">{booking.id}</strong> ({individualTickets.length} tickets)
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-bold text-xs cursor-pointer transition-all"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print All {individualTickets.length} Tickets</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
