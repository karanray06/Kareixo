"use client";

import { useState } from "react";
import { FiSave, FiCheckCircle } from "react-icons/fi";

type SettingsFormProps = {
  repoId: string;
  initialCategories: string[];
  initialTier: string;
  initialInstructions: string;
};

export default function SettingsForm({
  repoId,
  initialCategories,
  initialTier,
  initialInstructions,
}: SettingsFormProps) {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [tier, setTier] = useState<string>(initialTier);
  const [instructions, setInstructions] = useState<string>(initialInstructions);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/repositories/${repoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabledCategories: categories,
          preferredTier: tier,
          customInstructions: instructions,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const categoryList = ["logic", "security", "performance", "style"];

  return (
    <div className="space-y-8">
      {/* Categories */}
      <section className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold">Review Categories</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Select what kinds of issues Kareixo should flag during reviews.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          {categoryList.map((cat) => {
            const active = categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border transition-all ${
                  active
                    ? "border-[var(--color-sky-blue)] bg-[var(--color-sky-blue)]/10 text-[var(--color-sky-blue)]"
                    : "border-[var(--color-outline)]/20 text-[var(--text-secondary)] hover:border-[var(--color-outline)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Model Tier */}
      <section className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold">Model Tier</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Choose between fast reviews (default models) and deep reviews (stronger, slower models like DeepSeek).
        </p>
        <div className="flex gap-4 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tier"
              value="fast"
              checked={tier === "fast"}
              onChange={() => setTier("fast")}
              className="accent-[var(--color-sky-blue)]"
            />
            <span className="font-semibold text-sm">Fast</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tier"
              value="deep"
              checked={tier === "deep"}
              onChange={() => setTier("deep")}
              className="accent-[var(--color-sky-blue)]"
            />
            <span className="font-semibold text-sm">Deep</span>
          </label>
        </div>
      </section>

      {/* Custom Instructions */}
      <section className="bg-[var(--bg-elevated)] border border-[var(--color-outline)]/20 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold">Custom Instructions (Team Rules)</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Add specific instructions for this repository in plain text. Kareixo will obey them.
        </p>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., 'Always flag missing unit tests. Ignore TODO comments.'"
          className="w-full h-32 bg-[var(--bg-base)] border border-[var(--color-outline)]/20 rounded-xl p-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-sky-blue)] transition-colors"
        />
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-base)] rounded-full font-semibold text-sm hover:scale-105 transition-transform disabled:opacity-50"
        >
          <FiSave />
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && (
          <span className="flex items-center gap-2 text-sm text-[var(--color-mint)] font-semibold animate-fade-in">
            <FiCheckCircle />
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}
