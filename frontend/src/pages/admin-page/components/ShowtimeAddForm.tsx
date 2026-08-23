import React, { useState, useEffect, useMemo } from "react";
import { createShowtime } from "../../../services/showtimeApi";
import { getMovies } from "../../../services/movieApi";
import { getHalls } from "../../../services/hallApi";
import { getShowtimes } from "../../../services/showtimeApi";
import { Movie } from "../../../types/movie";
import { CinemaHall } from "../../../types/hall";
import { Showtime } from "../../../types/showtime";
import { useNotification } from "../../../context/NotificationContext";
import {
  Calendar,
  Clock,
  X,
  AlertCircle,
  Film,
  Tv,
  Sun,
  Sunset,
  Moon,
  Coffee,
  AlertTriangle,
} from "lucide-react";

interface ShowtimeAddFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const TIME_SLOTS = [
  { label: "Morning",   icon: "Coffee", slots: ["09:00 AM", "10:30 AM", "11:00 AM"] },
  { label: "Matinee",   icon: "Sun",    slots: ["01:30 PM", "02:00 PM", "03:30 PM", "04:30 PM"] },
  { label: "Evening",   icon: "Sunset", slots: ["06:00 PM", "07:00 PM", "07:30 PM", "08:15 PM"] },
  { label: "Night Show",icon: "Moon",   slots: ["09:30 PM", "10:00 PM", "10:45 PM", "11:15 PM"] },
];

function PeriodIcon({ name, className }: { name: string; className: string }) {
  switch (name) {
    case "Coffee": return <Coffee className={className} />;
    case "Sun":    return <Sun className={className} />;
    case "Sunset": return <Sunset className={className} />;
    case "Moon":   return <Moon className={className} />;
    default:       return <Clock className={className} />;
  }
}

function ShowtimeAddForm({ onSuccess, onCancel }: ShowtimeAddFormProps) {
  const { addNotification } = useNotification();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls]   = useState<CinemaHall[]>([]);
  const [existingShowtimes, setExistingShowtimes] = useState<Showtime[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form inputs
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedHallId, setSelectedHallId]   = useState("");
  const [showDate, setShowDate]               = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime]       = useState("07:30 PM");
  const [format, setFormat]                   = useState("Standard 2D");
  const [tierPrices, setTierPrices]           = useState<{ tierName: string; price: number }[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Fetch movies and halls on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const [moviesData, hallsData, showtimesData] = await Promise.all([
          getMovies(),
          getHalls(),
          getShowtimes(),
        ]);
        setMovies(moviesData);
        setHalls(hallsData);
        setExistingShowtimes(showtimesData);

        if (moviesData.length > 0) {
          setSelectedMovieId(moviesData[0].id);
        }
        if (hallsData.length > 0) {
          setSelectedHallId(hallsData[0].id);
          setFormat(hallsData[0].screenType || "Standard 2D");
          if (hallsData[0].seatTiers) {
            setTierPrices(
              hallsData[0].seatTiers.map((tier) => ({
                tierName: tier.tierName,
                price: 1500.0,
              }))
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movie/hall data");
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  const handleHallSelect = (hallId: string) => {
    setSelectedHallId(hallId);
    const hall = halls.find((h) => h.id === hallId);
    if (hall) {
      setFormat(hall.screenType || "Standard 2D");
      if (hall.seatTiers) {
        setTierPrices(
          hall.seatTiers.map((tier) => ({ tierName: tier.tierName, price: 1500.0 }))
        );
      }
    }
  };

  const handlePriceChange = (index: number, priceValue: number) => {
    setTierPrices((prev) =>
      prev.map((t, i) => (i === index ? { ...t, price: priceValue } : t))
    );
  };

  // Detect conflicts: same hall + same date + same time already booked
  const conflictingSlots = useMemo(() => {
    if (!selectedHallId || !showDate) return new Set<string>();
    const taken = new Set<string>();
    for (const st of existingShowtimes) {
      const hallId = typeof st.hall === "object" ? st.hall?.id : st.hall;
      if (hallId === selectedHallId && st.showDate === showDate) {
        taken.add(st.showTime);
      }
    }
    return taken;
  }, [existingShowtimes, selectedHallId, showDate]);

  const isCurrentSlotConflict = conflictingSlots.has(selectedTime);
  const selectedMovie = movies.find((m) => m.id === selectedMovieId);
  const selectedHall  = halls.find((h) => h.id === selectedHallId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedMovieId) { setError("Please select a movie"); return; }
    if (!selectedHallId)  { setError("Please select a cinema hall"); return; }
    if (!showDate)        { setError("Please specify show date"); return; }
    if (!selectedTime.trim()) { setError("Please select a time slot"); return; }
    if (isCurrentSlotConflict) {
      setError(`Hall is already booked at ${selectedTime} on this date. Pick another slot.`);
      return;
    }

    try {
      setSubmitting(true);
      await createShowtime({
        movieId: selectedMovieId,
        hallId: selectedHallId,
        showDate,
        showTime: selectedTime,
        format,
        tierPrices: tierPrices.map((tp) => ({
          tierName: tp.tierName,
          price: Number(tp.price) || 0,
        })),
      });

      addNotification({
        type: 'add',
        message: 'Added Successfully'
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create showtime");
      addNotification({
        type: 'error',
        message: 'Action Failed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="relative w-full max-w-3xl bg-[#0b0b0e]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950/80 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight">Schedule Movie Showtime</h3>
              <p className="text-[11px] text-zinc-400">Set auditorium screening slots and ticket prices</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-900 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loadingData ? (
          <div className="p-12 text-center text-zinc-400 flex flex-col items-center justify-center gap-3 flex-1">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading movies & auditorium halls...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1">
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* ── Movie & Hall Selection ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-red-500" />
                    Select Movie *
                  </label>
                  <select
                    value={selectedMovieId}
                    onChange={(e) => setSelectedMovieId(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {movies.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.duration || "2h"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-red-500" />
                    Select Cinema Hall *
                  </label>
                  <select
                    value={selectedHallId}
                    onChange={(e) => handleHallSelect(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {halls.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.screenType} · {h.totalCapacity} seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Date & Screening Format ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                    Screening Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                    Screening Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="Dolby Cinema">Dolby Cinema</option>
                    <option value="4DX">4DX Experience</option>
                    <option value="ScreenX">ScreenX 270°</option>
                    <option value="Standard 2D">Standard 2D</option>
                  </select>
                </div>
              </div>

              {/* ── Time Slots ── */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-400 uppercase flex items-center justify-between">
                  <span>Select Time Slot *</span>
                  <span className="text-xs text-amber-400 font-bold font-mono">{selectedTime}</span>
                </label>

                <div className="space-y-2.5">
                  {TIME_SLOTS.map((period) => (
                    <div key={period.label} className="p-3 bg-zinc-950 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                        <PeriodIcon name={period.icon} className="w-3.5 h-3.5 text-red-500" />
                        <span>{period.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {period.slots.map((slot) => {
                          const isConflict = conflictingSlots.has(slot);
                          const isSelected = selectedTime === slot;

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isConflict}
                              onClick={() => setSelectedTime(slot)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-red-600 text-white shadow-md"
                                  : isConflict
                                  ? "bg-zinc-900/50 text-zinc-600 line-through cursor-not-allowed border border-white/5"
                                  : "bg-zinc-900 text-zinc-300 hover:text-white border border-white/10"
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {isCurrentSlotConflict && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Selected time slot is already scheduled in this auditorium for {showDate}.</span>
                  </div>
                )}
              </div>

              {/* ── Tier Ticket Pricing ── */}
              {tierPrices.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase">
                    Tier Ticket Pricing (in LKR Rs.)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tierPrices.map((tp, idx) => (
                      <div key={idx} className="p-3 bg-zinc-950 rounded-xl border border-white/10 flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{tp.tierName}</span>
                        <div className="flex items-center gap-1.5 w-32">
                          <span className="text-xs text-zinc-500 font-bold">Rs.</span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={tp.price}
                            onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                            className="w-full bg-transparent border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500 text-right font-bold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="p-4 bg-zinc-950/80 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isCurrentSlotConflict}
                className="px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Saving Showtime..." : "Save Scheduled Showtime"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ShowtimeAddForm;
