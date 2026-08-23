import React, { useState } from "react";
import { updateHall } from "../../../services/hallApi";
import { CinemaHall } from "../../../types/hall";
import { useNotification } from "../../../context/NotificationContext";
import { Tv, Plus, Trash2, X, CheckCircle2, AlertCircle, Armchair, Edit3 } from "lucide-react";

interface HallEditFormProps {
  hall: CinemaHall;
  onSuccess: () => void;
  onCancel: () => void;
}

interface TierInput {
  tierName: string;
  seatCount: number | "";
}

function HallEditForm({ hall, onSuccess, onCancel }: HallEditFormProps) {
  const { addNotification } = useNotification();
  const [name, setName] = useState(hall.name || "");
  const [screenType, setScreenType] = useState(hall.screenType || "Standard 2D");
  const [seatTiers, setSeatTiers] = useState<TierInput[]>(
    hall.seatTiers && hall.seatTiers.length > 0
      ? hall.seatTiers.map((t) => ({ tierName: t.tierName, seatCount: t.seatCount }))
      : [
          { tierName: "VIP / Recliner", seatCount: 20 },
          { tierName: "Standard", seatCount: 60 },
        ]
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTier = () => {
    setSeatTiers((prev) => [
      ...prev,
      { tierName: "Economy", seatCount: 40 },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (seatTiers.length <= 1) {
      alert("At least one seat tier is required.");
      return;
    }
    setSeatTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTierChange = (
    index: number,
    field: keyof TierInput,
    value: string | number
  ) => {
    setSeatTiers((prev) =>
      prev.map((tier, i) => {
        if (i === index) {
          return { ...tier, [field]: value };
        }
        return tier;
      })
    );
  };

  const totalCapacity = seatTiers.reduce(
    (acc, tier) => acc + (Number(tier.seatCount) || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Hall name is required");
      return;
    }

    if (seatTiers.length === 0) {
      setError("At least one seat tier must be defined");
      return;
    }

    for (const tier of seatTiers) {
      if (!tier.tierName.trim()) {
        setError("All seat tiers must have a name");
        return;
      }
      if (!tier.seatCount || Number(tier.seatCount) <= 0) {
        setError(`Seat count for "${tier.tierName}" must be greater than 0`);
        return;
      }
    }

    try {
      setSubmitting(true);
      await updateHall(hall.id, {
        name: name.trim(),
        screenType,
        seatTiers: seatTiers.map((t) => ({
          tierName: t.tierName.trim(),
          seatCount: Number(t.seatCount),
          price: 0,
        })),
      });

      addNotification({
        type: 'info',
        title: 'Cinema Hall Updated 🏛️',
        message: `Hall "${name}" configuration and seat tiers were updated.`,
        actionUrl: '/admin',
        actionLabel: 'View in Admin'
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cinema hall");
      addNotification({
        type: 'error',
        title: 'Hall Update Failed',
        message: err instanceof Error ? err.message : "Failed to update cinema hall."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="relative w-full max-w-xl bg-[#151b2d] border border-white/15 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-[#0c1324] border-b border-[#2e3447] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Edit Cinema Hall — {hall.name}</h3>
              <p className="text-[11px] text-[#908fa0]">Modify hall layout and seat capacities</p>
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs sm:text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1.5">
                  Hall Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hall A - IMAX Laser"
                  className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1.5">
                  Screen Format
                </label>
                <select
                  value={screenType}
                  onChange={(e) => setScreenType(e.target.value)}
                  className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#c0c1ff] transition-colors cursor-pointer"
                >
                  <option value="IMAX 3D">IMAX 3D</option>
                  <option value="4DX">4DX</option>
                  <option value="Dolby Cinema">Dolby Cinema</option>
                  <option value="Standard 2D">Standard 2D</option>
                  <option value="ScreenX">ScreenX</option>
                </select>
              </div>
            </div>

            {/* Seat Tiers Management */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#908fa0] uppercase">
                  <Armchair className="w-4 h-4 text-amber-400" />
                  Seat Tiers & Capacities
                </div>
                <span className="text-xs font-bold text-amber-400 bg-[#0c1324] px-3 py-1 rounded-full border border-[#2e3447]">
                  Total: {totalCapacity} Seats
                </span>
              </div>

              <div className="space-y-2.5">
                {seatTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 bg-[#0c1324] border border-[#2e3447] rounded-2xl"
                  >
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase font-semibold text-[#908fa0] mb-1">Tier Name</label>
                      <input
                        type="text"
                        required
                        value={tier.tierName}
                        onChange={(e) => handleTierChange(idx, "tierName", e.target.value)}
                        placeholder="e.g. VIP / Recliner"
                        className="w-full bg-[#151b2d] border border-[#2e3447] text-[#dce1fb] placeholder-[#908fa0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c0c1ff] transition-colors"
                      />
                    </div>

                    <div className="w-32">
                      <label className="block text-[10px] uppercase font-semibold text-[#908fa0] mb-1">Seats</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={tier.seatCount}
                        onChange={(e) =>
                          handleTierChange(idx, "seatCount", Number(e.target.value))
                        }
                        placeholder="50"
                        className="w-full bg-[#151b2d] border border-[#2e3447] text-[#dce1fb] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c0c1ff] transition-colors"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer mt-4"
                      title="Remove Tier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddTier}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-white px-3.5 py-2 bg-[#0c1324] hover:bg-[#191f31] border border-[#2e3447] rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Tier
              </button>
            </div>
          </div>

          {/* Sticky Footer */}
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
              disabled={submitting}
              className="liquid-glow-btn text-surface-container-lowest text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-surface-container-lowest border-t-transparent rounded-full animate-spin" />
                  <span>Updating Hall...</span>
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
      </div>
    </div>
  );
}

export default HallEditForm;
