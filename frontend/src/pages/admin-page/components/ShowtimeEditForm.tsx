import React, { useState, useEffect, useMemo } from "react";
import { updateShowtime } from "../../../services/showtimeApi";
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
  Banknote,
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
  Edit3,
} from "lucide-react";

interface ShowtimeEditFormProps {
  showtime: Showtime;
  onSuccess: () => void;
  onCancel: () => void;
}

const SCREEN_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "IMAX 3D":      { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-300" },
  "4DX":          { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-300" },
  "Dolby Cinema": { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-300" },
  "Standard 2D":  { bg: "bg-slate-500/10",  border: "border-slate-500/30",  text: "text-slate-300" },
  "ScreenX":      { bg: "bg-teal-500/10",   border: "border-teal-500/30",   text: "text-teal-300" },
};

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

function ShowtimeEditForm({ showtime, onSuccess, onCancel }: ShowtimeEditFormProps) {
  const { addNotification } = useNotification();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [halls, setHalls]   = useState<CinemaHall[]>([]);
  const [existingShowtimes, setExistingShowtimes] = useState<Showtime[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form inputs initialized from showtime prop
  const [selectedMovieId, setSelectedMovieId] = useState(() =>
    typeof showtime.movie === "object" ? showtime.movie?.id || "" : showtime.movie || ""
  );
  const [selectedHallId, setSelectedHallId]   = useState(() =>
    typeof showtime.hall === "object" ? showtime.hall?.id || "" : showtime.hall || ""
  );
  const [showDate, setShowDate]               = useState(showtime.showDate || "");
  const [selectedTime, setSelectedTime]       = useState(showtime.showTime || "07:30 PM");
  const [format, setFormat]                   = useState(showtime.format || "Standard 2D");
  const [tierPrices, setTierPrices]           = useState<{ tierName: string; price: number }[]>(
    showtime.tierPrices || []
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Fetch all movies, halls, and showtimes
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

        // If tier prices empty in showtime, initialize from hall
        if ((!showtime.tierPrices || showtime.tierPrices.length === 0) && hallsData.length > 0) {
          const currentHall = hallsData.find(
            (h) => h.id === (typeof showtime.hall === "object" ? showtime.hall?.id : showtime.hall)
          );
          if (currentHall?.seatTiers) {
            setTierPrices(
              currentHall.seatTiers.map((t) => ({
                tierName: t.tierName,
                price: t.price || 15.0,
              }))
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [showtime]);

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

  // Detect conflicts excluding the current record
  const conflictingSlots = useMemo(() => {
    if (!selectedHallId || !showDate) return new Set<string>();
    const taken = new Set<string>();
    for (const st of existingShowtimes) {
      if (st.id === showtime.id) continue; // Skip current record
      const hallId = typeof st.hall === "object" ? st.hall?.id : st.hall;
      if (hallId === selectedHallId && st.showDate === showDate) {
        taken.add(st.showTime);
      }
    }
    return taken;
  }, [existingShowtimes, selectedHallId, showDate, showtime.id]);

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
      await updateShowtime(showtime.id, {
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
        type: 'info',
        title: 'Showtime Updated 📅',
        message: `Screening for "${selectedMovie?.title || 'Movie'}" in ${selectedHall?.name || 'Hall'} (${selectedTime}, ${showDate}) was updated.`,
        actionUrl: '/admin',
        actionLabel: 'View Schedule'
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update showtime forecasting");
      addNotification({
        type: 'error',
        title: 'Showtime Update Failed',
        message: err instanceof Error ? err.message : "Failed to update showtime."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const screenColors = selectedHall
    ? SCREEN_TYPE_COLORS[selectedHall.screenType] ?? SCREEN_TYPE_COLORS["Standard 2D"]
    : SCREEN_TYPE_COLORS["Standard 2D"];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="relative w-full max-w-3xl bg-[#151b2d] border border-white/15 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#0c1324] border-b border-[#2e3447] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Edit Scheduled Showtime</h3>
              <p className="text-[11px] text-[#908fa0]">Modify screening slot or ticket tier pricing</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#908fa0] hover:text-white p-2 rounded-xl hover:bg-[#2e3447] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loadingData ? (
          <div className="p-12 text-center text-[#908fa0] flex flex-col items-center justify-center gap-3 flex-1">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading showtime information...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1">
              {error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* ── Step 1: Movie Selection ── */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#908fa0] uppercase tracking-wider">
                  <Film className="w-3.5 h-3.5 text-primary" />
                  Step 1 — Select Movie
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
                  <div className="space-y-2">
                    <select
                      required
                      value={selectedMovieId}
                      onChange={(e) => setSelectedMovieId(e.target.value)}
                      className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#c0c1ff] transition-colors cursor-pointer"
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
                          <span key={g} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20">
                            {g}
                          </span>
                        ))}
                        {selectedMovie.ageRating && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                            {selectedMovie.ageRating}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Movie Poster Preview */}
                  {selectedMovie?.posterUrl ? (
                    <div className="relative w-16 h-24 rounded-xl overflow-hidden border border-[#2e3447] shrink-0 shadow-lg">
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
                    <div className="w-16 h-24 rounded-xl border border-[#2e3447] bg-[#0c1324] flex items-center justify-center text-[#464554] shrink-0">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </section>

              <div className="border-t border-[#2e3447]" />

              {/* ── Step 2: Cinema Hall ── */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#908fa0] uppercase tracking-wider">
                  <Tv className="w-3.5 h-3.5 text-primary" />
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
                        className={`relative text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer group ${
                          isSelected
                            ? "border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                            : "border-[#2e3447] bg-[#0c1324] hover:border-[#464554]"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5">
                            <CheckCircle2 className="w-4 h-4 text-amber-400" />
                          </div>
                        )}
                        <div className="font-bold text-[#dce1fb] text-sm truncate pr-5">{hall.name}</div>
                        <div className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${colors.bg} ${colors.border} ${colors.text}`}>
                          {hall.screenType}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-[#908fa0]">
                          <Tv className="w-3 h-3" />
                          {hall.totalCapacity} seats
                        </div>
                        {hall.seatTiers?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {hall.seatTiers.map((t) => (
                              <span key={t.tierName} className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#151b2d] text-[#908fa0] border border-[#2e3447]">
                                {t.tierName} ({t.seatCount})
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Format selector */}
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
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
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
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Step 3 — Pick Date & Time Slot
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-[#908fa0] uppercase whitespace-nowrap flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Date:
                  </label>
                  <input
                    type="date"
                    required
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    className="bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff] transition-colors cursor-pointer"
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
                              className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                isConflict
                                  ? "opacity-40 cursor-not-allowed border-rose-500/20 bg-rose-500/5 text-rose-400 line-through"
                                  : isSelected
                                  ? "border-amber-400 bg-amber-400/20 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.2)]"
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
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${
                  isCurrentSlotConflict
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                }`}>
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    {isCurrentSlotConflict
                      ? `⚠ Hall conflict at ${selectedTime} — choose a different slot`
                      : `Selected: ${selectedTime} on ${showDate}`}
                  </span>
                </div>
              </section>

              <div className="border-t border-[#2e3447]" />

              {/* ── Step 4: Tier Pricing ── */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#908fa0] uppercase tracking-wider">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                  Step 4 — Ticket Prices per Tier
                </div>

                {tierPrices.length === 0 ? (
                  <p className="text-xs text-[#908fa0] italic">No seat tiers defined for selected hall.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {tierPrices.map((tp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 bg-[#0c1324] border border-[#2e3447] rounded-2xl"
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
                          <span className="text-[#908fa0] font-bold text-xs">Rs.</span>
                          <input
                            type="number"
                            step="0.50"
                            min="0"
                            value={tp.price}
                            onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                            placeholder="15.00"
                            className="w-24 bg-[#151b2d] border border-[#2e3447] text-[#dce1fb] rounded-xl px-3 py-1.5 text-sm text-right focus:outline-none focus:border-[#c0c1ff] transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Summary Banner ── */}
              {selectedMovie && selectedHall && (
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0c1324] border border-[#2e3447]">
                  {selectedMovie.posterUrl && (
                    <img src={selectedMovie.posterUrl} alt="" className="w-10 h-14 object-cover rounded-xl border border-[#2e3447]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[#dce1fb] truncate">{selectedMovie.title}</div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                      <span className="text-xs text-[#908fa0] flex items-center gap-1">
                        <Tv className="w-3 h-3 text-primary" /> {selectedHall.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${screenColors.bg} ${screenColors.border} ${screenColors.text}`}>
                        {selectedHall.screenType}
                      </span>
                      <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> {selectedTime}
                      </span>
                      <span className="text-xs text-[#908fa0]">
                        <Calendar className="w-3 h-3 inline mr-1 text-primary" />{showDate}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Sticky Footer ── */}
            <div className="px-6 py-4 bg-[#0c1324] border-t border-[#2e3447] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#dce1fb] bg-[#191f31] hover:bg-[#2e3447] rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isCurrentSlotConflict}
                className="liquid-glow-btn text-surface-container-lowest text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-surface-container-lowest border-t-transparent rounded-full animate-spin" />
                    <span>Updating Showtime...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Changes</span>
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

export default ShowtimeEditForm;
