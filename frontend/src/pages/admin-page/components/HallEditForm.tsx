import React, { useState } from "react";
import { updateHall } from "../../../services/hallApi";
import { CinemaHall } from "../../../types/hall";
import { useNotification } from "../../../context/NotificationContext";
import { Tv, Plus, Trash2, X, AlertCircle, Armchair } from "lucide-react";

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
        type: 'success',
        message: 'Updated Successfully'
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cinema hall");
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
        className="relative w-full max-w-2xl bg-[#0b0b0e]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950/80 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight">Edit Cinema Hall</h3>
              <p className="text-[11px] text-zinc-400">Modify configuration for "{hall.name}"</p>
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                  Cinema Hall Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">
                  Screen Format *
                </label>
                <select
                  value={screenType}
                  onChange={(e) => setScreenType(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
                >
                  <option value="IMAX 3D">IMAX 3D Laser</option>
                  <option value="Dolby Cinema">Dolby Cinema Atmos</option>
                  <option value="4DX">4DX Motion & Effects</option>
                  <option value="ScreenX">ScreenX 270° Panoramic</option>
                  <option value="Standard 2D">Standard 2D Digital</option>
                </select>
              </div>
            </div>

            {/* Total Capacity Pill */}
            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20">
                  <Armchair className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-zinc-400 font-medium block">Total Computed Capacity</span>
                  <span className="text-xs text-zinc-500">Calculated dynamically across active tiers</span>
                </div>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {totalCapacity} <span className="text-xs font-normal text-zinc-400">Seats</span>
              </div>
            </div>

            {/* Seat Tiers List */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-400 uppercase">
                  Seat Tiers & Capacities
                </label>
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tier</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {seatTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-white/10"
                  >
                    <input
                      type="text"
                      placeholder="Tier Name (e.g. VIP Recliner)"
                      value={tier.tierName}
                      onChange={(e) => handleTierChange(idx, "tierName", e.target.value)}
                      className="flex-1 bg-transparent border border-white/10 text-white placeholder:text-zinc-600 text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    />

                    <div className="w-28 sm:w-36 flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        placeholder="Seats"
                        value={tier.seatCount}
                        onChange={(e) =>
                          handleTierChange(
                            idx,
                            "seatCount",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        className="w-full bg-transparent border border-white/10 text-white text-xs sm:text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500 text-right"
                      />
                      <span className="text-xs text-zinc-500">seats</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="p-2 text-zinc-500 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove tier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Saving Changes..." : "Update Cinema Hall"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HallEditForm;
