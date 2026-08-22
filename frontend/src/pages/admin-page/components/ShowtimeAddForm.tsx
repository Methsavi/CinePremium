import React, { useState, useEffect, useMemo } from "react";
import { createShowtime } from "../../../services/showtimeApi";
import { getMovies } from "../../../services/movieApi";
import { getHalls } from "../../../services/hallApi";
import { getShowtimes } from "../../../services/showtimeApi";
import { Movie } from "../../../types/movie";
import { CinemaHall } from "../../../types/hall";
import { Showtime } from "../../../types/showtime";
import {
  Calendar,
  Clock,
  DollarSign,
  X,
  CheckCircle2,
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

interface TierPriceInput {
  tierName: string;
  price: number | "";
}

// Predefined time slots grouped by period
const TIME_SLOTS = [
  { label: "Morning", icon: "coffee",  slots: ["09:00 AM", "10:00 AM", "11:00 AM", "11:30 AM"] },
  { label: "Afternoon", icon: "sun",   slots: ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "03:30 PM"] },
  { label: "Evening", icon: "sunset",  slots: ["04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "07:30 PM"] },
  { label: "Night", icon: "moon",      slots: ["08:00 PM", "09:00 PM", "10:00 PM", "10:30 PM", "11:00 PM"] },
];

const SCREEN_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "IMAX 3D":      { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-300" },
  "4DX":          { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-300" },
  "Dolby Cinema": { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-300" },
  "Standard 2D":  { bg: "bg-slate-500/10",  border: "border-slate-500/30",  text: "text-slate-300" },
  "ScreenX":      { bg: "bg-teal-500/10",   border: "border-teal-500/30",   text: "text-teal-300" },
};

function PeriodIcon({ name, className }: { name: string; className?: string }) {
  if (name === "coffee") return <Coffee className={className} />;
  if (name === "sun")    return <Sun className={className} />;
  if (name === "sunset") return <Sunset className={className} />;
  return <Moon className={className} />;
}

function ShowtimeAddForm({ onSuccess, onCancel }: ShowtimeAddFormProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls] = useState<CinemaHall[]>([]);
  const [existingShowtimes, setExistingShowtimes] = useState<Showtime[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedHallId, setSelectedHallId] = useState("");
  const [showDate, setShowDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState("07:30 PM");
  const [format, setFormat] = useState("Standard 2D");
  const [tierPrices, setTierPrices] = useState<TierPriceInput[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoadingData(true);
        const [movieList, hallList, showtimeList] = await Promise.all([
          getMovies(),
          getHalls(),
          getShowtimes(),
        ]);
        setMovies(movieList);
        setHalls(hallList);
        setExistingShowtimes(showtimeList);

        if (movieList.length > 0) setSelectedMovieId(movieList[0].id);
        if (hallList.length > 0) {
          const firstHall = hallList[0];
          setSelectedHallId(firstHall.id);
          setFormat(firstHall.screenType || "Standard 2D");
          if (firstHall.seatTiers) {
            setTierPrices(
              firstHall.seatTiers.map((tier) => ({ tierName: tier.tierName, price: 15.0 }))
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movies or halls");
      } finally {
        setLoadingData(false);
      }
    };
    loadResources();
  }, []);

  const handleHallSelect = (hallId: string) => {
    setSelectedHallId(hallId);
    const hall = halls.find((h) => h.id === hallId);
    if (hall) {
      setFormat(hall.screenType || "Standard 2D");
      if (hall.seatTiers) {
        setTierPrices(
          hall.seatTiers.map((tier) => ({ tierName: tier.tierName, price: 15.0 }))
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
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create showtime forecasting");
    } finally {
      setSubmitting(false);
    }
  };

  const screenColors = selectedHall
    ? SCREEN_TYPE_COLORS[selectedHall.screenType] ?? SCREEN_TYPE_COLORS["Standard 2D"]
    : SCREEN_TYPE_COLORS["Standard 2D"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#151b2d] border border-[#2e3447] rounded-2xl shadow-2xl overflow-hidden my-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0c1324] border-b border-[#2e3447]">
          <div className="flex items-center gap-2.5 text-[#c0c1ff]">
            <Calendar className="w-5 h-5" />
            <h3 className="text-lg font-bold text-[#dce1fb]">Schedule Movie Showtime</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[#908fa0] hover:text-white p-1.5 rounded-lg hover:bg-[#2e3447] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loadingData ? (
          <div className="p-12 text-center text-[#908fa0] flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#c0c1ff] border-t-transparent rounded-full animate-spin" />
            <span>Loading movies & halls...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* ── Step 1: Movie Selection ── */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#908fa0] uppercase tracking-wider">
                <Film className="w-3.5 h-3.5 text-[#c0c1ff]" />
                Step 1 — Select Movie
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
                <div className="space-y-2">
                  <select
                    required
                    value={selectedMovieId}
                    onChange={(e) => setSelectedMovieId(e.target.value)}
                    className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#c0c1ff] transition-colors"
                  >
                    {movies.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} — {m.status === "now_showing" ? "Now Showing" : "Coming Soon"}{m.duration ? ` (${m.duration})` : ""}
                      </option>
                    ))}
                  </select>

                  {selectedMovie && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMovie.genres?.slice(0, 3).map((g) => (
                        <span key={g} className="px-2 py-0.5 rounded-full bg-[#c0c1ff]/10 text-[#c0c1ff] text-[10px] font-semibold border border-[#c0c1ff]/20">
                          {g}
                        </span>
                      ))}
                      {selectedMovie.ageRating && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                          {selectedMovie.ageRating}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Movie Poster Preview */}
                {selectedMovie?.posterUrl ? (
                  <div className="relative w-16 h-24 rounded-lg overflow-hidden border border-[#2e3447] flex-shrink-0 shadow-lg">
                    <img
                      src={selectedMovie.posterUrl}
                      alt={selectedMovie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute bottom-0 inset-x-0 py-0.5 text-center text-[8px] font-bold ${selectedMovie.status === "now_showing" ? "bg-emerald-500/90 text-white" : "bg-[#c0c1ff]/90 text-[#1000a9]"}`}>
                      {selectedMovie.status === "now_showing" ? "LIVE" : "SOON"}
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-24 rounded-lg border border-[#2e3447] bg-[#0c1324] flex items-center justify-center text-[#464554] flex-shrink-0">
                    <Film className="w-6 h-6" />
                  </div>
                )}
              </div>
            </section>

            <div className="border-t border-[#2e3447]" />

            {/* ── Step 2: Cinema Hall ── */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#908fa0] uppercase tracking-wider">
                <Tv className="w-3.5 h-3.5 text-[#c0c1ff]" />
                Step 2 — Assign Cinema Hall
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {halls.map((hall) => {
                  const colors = SCREEN_TYPE_COLORS[hall.screenType] ?? SCREEN_TYPE_COLORS["Standard 2D"];
                  const isSelected = hall.id === selectedHallId;
                  return (
                    <button
                      key={hall.id}
                      type="button"
                      onClick={() => handleHallSelect(hall.id)}
                      className={`relative text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer group ${
                        isSelected
                          ? "border-[#c0c1ff] bg-[#c0c1ff]/5 shadow-[0_0_12px_#c0c1ff22]"
                          : "border-[#2e3447] bg-[#0c1324] hover:border-[#464554]"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-[#c0c1ff]" />
                        </div>
                      )}
                      <div className="font-bold text-[#dce1fb] text-sm truncate pr-5">{hall.name}</div>
                      <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors.bg} ${colors.border} ${colors.text}`}>
                        {hall.screenType}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-[11px] text-[#908fa0]">
                        <Tv className="w-3 h-3" />
                        {hall.totalCapacity} seats
                      </div>
                      {hall.seatTiers?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {hall.seatTiers.map((t) => (
                            <span key={t.tierName} className="text-[9px] px-1.5 py-0.5 rounded bg-[#151b2d] text-[#908fa0] border border-[#2e3447]">
                              {t.tierName} ({t.seatCount})
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Format selector (auto-set from hall, overrideable) */}
              <div className="flex items-center gap-3 pt-1">
                <label className="text-xs font-semibold text-[#908fa0] uppercase whitespace-nowrap">Format:</label>
                <div className="flex flex-wrap gap-2">
                  {(["IMAX 3D", "4DX", "Dolby Cinema", "Standard 2D", "ScreenX"] as const).map((f) => {
                    const c = SCREEN_TYPE_COLORS[f];
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormat(f)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                          format === f
                            ? `${c.bg} ${c.border} ${c.text}`
                            : "bg-transparent border-[#2e3447] text-[#908fa0] hover:border-[#464554] hover:text-[#dce1fb]"
                        }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <div className="border-t border-[#2e3447]" />

            {/* ── Step 3: Date & Time Slots ── */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#908fa0] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#c0c1ff]" />
                Step 3 — Pick Date & Time Slot
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-[#908fa0] uppercase whitespace-nowrap flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#c0c1ff]" /> Date:
                </label>
                <input
                  type="date"
                  required
                  value={showDate}
                  onChange={(e) => setShowDate(e.target.value)}
                  className="bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff] transition-colors"
                />
              </div>

              {/* Time Slots by Period */}
              <div className="space-y-3">
                {TIME_SLOTS.map((period) => (
                  <div key={period.label} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#908fa0] uppercase">
                      <PeriodIcon name={period.icon} className="w-3 h-3" />
                      {period.label}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {period.slots.map((slot) => {
                        const isConflict  = conflictingSlots.has(slot);
                        const isSelected  = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isConflict}
                            onClick={() => !isConflict && setSelectedTime(slot)}
                            title={isConflict ? "Hall already booked at this time" : slot}
                            className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isConflict
                                ? "opacity-40 cursor-not-allowed border-rose-500/20 bg-rose-500/5 text-rose-400 line-through"
                                : isSelected
                                ? "border-[#c0c1ff] bg-[#c0c1ff]/15 text-[#c0c1ff] shadow-[0_0_8px_#c0c1ff33]"
                                : "border-[#2e3447] bg-[#0c1324] text-[#dce1fb] hover:border-[#c0c1ff]/50 hover:bg-[#c0c1ff]/5"
                            }`}
                          >
                            {slot}
                            {isConflict && (
                              <AlertTriangle className="inline-block ml-1 w-2.5 h-2.5 text-rose-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Slot Summary */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold ${
                isCurrentSlotConflict
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  : "bg-[#c0c1ff]/8 border-[#c0c1ff]/20 text-[#c0c1ff]"
              }`}>
                <Clock className="w-4 h-4" />
                {isCurrentSlotConflict
                  ? `⚠ Hall conflict at ${selectedTime} — choose a different slot`
                  : `Selected: ${selectedTime} on ${showDate}`}
              </div>
            </section>

            <div className="border-t border-[#2e3447]" />

            {/* ── Step 4: Tier Pricing ── */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#908fa0] uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Step 4 — Forecasting Ticket Prices per Tier
              </div>

              {tierPrices.length === 0 ? (
                <p className="text-xs text-[#908fa0] italic">No seat tiers defined for selected hall.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tierPrices.map((tp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[#0c1324] border border-[#2e3447] rounded-xl"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#dce1fb]">{tp.tierName}</div>
                        {selectedHall?.seatTiers?.[idx] && (
                          <div className="text-[10px] text-[#908fa0]">
                            {selectedHall.seatTiers[idx].seatCount} seats
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#908fa0] font-bold text-sm">$</span>
                        <input
                          type="number"
                          step="0.50"
                          min="0"
                          value={tp.price}
                          onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                          placeholder="15.00"
                          className="w-20 bg-[#151b2d] border border-[#2e3447] text-[#dce1fb] rounded-md px-2.5 py-1.5 text-sm text-right focus:outline-none focus:border-[#c0c1ff] transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Summary Banner ── */}
            {selectedMovie && selectedHall && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0c1324] border border-[#2e3447]">
                {selectedMovie.posterUrl && (
                  <img src={selectedMovie.posterUrl} alt="" className="w-10 h-14 object-cover rounded-md border border-[#2e3447]" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#dce1fb] truncate">{selectedMovie.title}</div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-[#908fa0] flex items-center gap-1">
                      <Tv className="w-3 h-3 text-[#c0c1ff]" /> {selectedHall.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${screenColors.bg} ${screenColors.border} ${screenColors.text}`}>
                      {selectedHall.screenType}
                    </span>
                    <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> {selectedTime}
                    </span>
                    <span className="text-xs text-[#908fa0]">
                      <Calendar className="w-3 h-3 inline mr-1 text-[#c0c1ff]" />{showDate}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2e3447]">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-sm font-medium text-[#dce1fb] bg-[#191f31] hover:bg-[#2e3447] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isCurrentSlotConflict}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-[#1000a9] bg-[#c0c1ff] hover:bg-white rounded-lg transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1000a9] border-t-transparent rounded-full animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Showtime
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ShowtimeAddForm;
