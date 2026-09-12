"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";

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
      <section className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-1">Review Categories</h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Select what kinds of issues Kareixo should flag during reviews.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {categoryList.map((cat) => {
            const active = categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize border transition-all ${
                  active
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-default)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Model Tier */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-1">Model Tier</h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Choose between fast reviews (default models) and deep reviews (stronger, slower models like DeepSeek).
        </p>
        <div className="flex gap-6 mt-5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="tier"
              value="fast"
              checked={tier === "fast"}
              onChange={() => setTier("fast")}
              className="accent-[var(--color-primary)] w-4 h-4"
            />
            <span className="font-medium text-sm">Fast</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="tier"
              value="deep"
              checked={tier === "deep"}
              onChange={() => setTier("deep")}
              className="accent-[var(--color-primary)] w-4 h-4"
            />
            <span className="font-medium text-sm">Deep</span>
          </label>
        </div>
      </section>

      {/* Custom Instructions */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border-default)] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-1">Custom Instructions (Team Rules)</h2>
        <p className="text-sm text-[var(--color-fg-muted)] mb-4">
          Add specific instructions for this repository in plain text. Kareixo will obey them.
        </p>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., 'Always flag missing unit tests. Ignore TODO comments.'"
          className="input h-32 resize-none"
        />
      </section>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium animate-fade-in-up">
            <CheckCircle2 size={16} />
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}
