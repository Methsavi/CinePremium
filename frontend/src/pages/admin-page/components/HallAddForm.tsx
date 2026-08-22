import React, { useState } from "react";
import { createHall } from "../../../services/hallApi";
import { Tv, Plus, Trash2, X, CheckCircle2, AlertCircle, Armchair } from "lucide-react";

interface HallAddFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface TierInput {
  tierName: string;
  seatCount: number | "";
}

function HallAddForm({ onSuccess, onCancel }: HallAddFormProps) {
  const [name, setName] = useState("");
  const [screenType, setScreenType] = useState("IMAX 3D");
  const [seatTiers, setSeatTiers] = useState<TierInput[]>([
    { tierName: "VIP / Recliner", seatCount: 20 },
    { tierName: "Standard", seatCount: 60 },
  ]);

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
      await createHall({
        name,
        screenType,
        seatTiers: seatTiers.map((t) => ({
          tierName: t.tierName,
          seatCount: Number(t.seatCount),
          price: 0,
        })),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create cinema hall");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#151b2d] border border-[#2e3447] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0c1324] border-b border-[#2e3447]">
          <div className="flex items-center gap-2 text-[#c0c1ff]">
            <Tv className="w-5 h-5" />
            <h3 className="text-lg font-bold text-[#dce1fb]">Add New Cinema Hall</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[#908fa0] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1">
                Hall Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hall A - IMAX Laser"
                className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#908fa0] uppercase mb-1">
                Screen Format
              </label>
              <select
                value={screenType}
                onChange={(e) => setScreenType(e.target.value)}
                className="w-full bg-[#0c1324] border border-[#2e3447] text-[#dce1fb] rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-[#c0c1ff]"
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
                <Armchair className="w-4 h-4 text-[#c0c1ff]" />
                Seat Tiers & Seat Capacities
              </div>
              <span className="text-xs font-bold text-[#c0c1ff] bg-[#0c1324] px-2.5 py-1 rounded-full border border-[#2e3447]">
                Total Capacity: {totalCapacity} Seats
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {seatTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-[#0c1324] border border-[#2e3447] rounded-xl"
                >
                  <div className="flex-1">
                    <label className="block text-[10px] text-[#908fa0] mb-0.5">Tier Name</label>
                    <input
                      type="text"
                      required
                      value={tier.tierName}
                      onChange={(e) => handleTierChange(idx, "tierName", e.target.value)}
                      placeholder="e.g. VIP / Recliner"
                      className="w-full bg-[#151b2d] border border-[#2e3447] text-[#dce1fb] rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c0c1ff]"
                    />
                  </div>

                  <div className="w-32">
                    <label className="block text-[10px] text-[#908fa0] mb-0.5">Seat Count</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={tier.seatCount}
                      onChange={(e) =>
                        handleTierChange(idx, "seatCount", Number(e.target.value))
                      }
                      placeholder="50"
                      className="w-full bg-[#151b2d] border border-[#2e3447] text-[#dce1fb] rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c0c1ff]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTier(idx)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer mt-4"
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
              className="flex items-center gap-1.5 text-xs font-semibold text-[#c0c1ff] hover:text-white px-3 py-1.5 bg-[#0c1324] hover:bg-[#191f31] border border-[#2e3447] rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another Seat Tier
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2e3447]">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[#dce1fb] bg-[#191f31] hover:bg-[#2e3447] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-[#1000a9] bg-[#c0c1ff] hover:bg-white rounded-lg transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#1000a9] border-t-transparent rounded-full animate-spin" />
                  Creating Hall...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Hall Structure
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HallAddForm;
