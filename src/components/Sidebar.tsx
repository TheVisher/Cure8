import React from "react";

const cats = ["All", "Work", "Personal"];

export function Sidebar({ active = "All", onChange }: { active?: string; onChange?: (c: string)=>void }) {
  return (
    <div className="bg-surface rounded-card p-3 border border-white/5">
      <div className="text-accent-purple font-semibold text-lg mb-3">Collections</div>
      <div className="flex flex-col gap-2">
        {cats.map(c => (
          <button
            key={c}
            onClick={() => onChange?.(c)}
            className={[
              "px-4 py-2 rounded-pill text-sm transition",
              c === active
                ? "bg-background/80 border border-accent-purple text-text-primary shadow-glow"
                : "bg-background/60 border border-white/10 text-text-secondary hover:border-accent-purple/40"
            ].join(" ")}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <button className="w-full rounded-pill bg-gradient-to-r from-accent-purple to-accent-purpleHover text-white px-4 py-2 shadow-glow hover:brightness-110">
          + Add Content
        </button>
      </div>
    </div>
  );
}
