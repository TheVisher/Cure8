import React from "react";

type Props = {
  title: string;
  domain: string;
  image?: string | null;
  state?: "ok"|"pending"|"error"|"blocked";
  onClick?: () => void;
};

export function Card({ title, domain, image, state="ok", onClick }: Props) {
  const showSkeleton = state === "pending";
  const showBrand = !image && state !== "pending";

  return (
    <div
      onClick={onClick}
      className="group relative rounded-card bg-surface border border-white/8 shadow-card overflow-hidden transition hover:shadow-glow hover:-translate-y-0.5"
    >
      {/* Image / skeleton / brand fallback */}
      <div className="relative aspect-[4/5]">
        {showSkeleton && (
          <div className="h-full w-full animate-pulse bg-white/5" />
        )}
        {!showSkeleton && image && (
          <img src={image} alt="" className="h-full w-full object-cover" />
        )}
        {!showSkeleton && showBrand && (
          <div className="h-full w-full flex items-center justify-center bg-white/5 text-text-secondary">
            {domain}
          </div>
        )}
        {/* Purple outline for media frame */}
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-accent-purple/60"></div>
        {/* Gradient overlay for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60 opacity-90"></div>
      </div>

      {/* Text */}
      <div className="p-3">
        <div className="text-sm font-semibold text-white line-clamp-2">{title}</div>
        <div className="text-[12px] text-text-muted mt-1">{domain}</div>
      </div>
    </div>
  );
}
