import React from "react";

export function Card({ title, domain, image, state="ok", onClick, layout="grid" }) {
  const showSkeleton = state === "pending";
  const showBrand = !image && state !== "pending";
  const isMasonry = layout === "masonry";

  const cardClasses = ["bookmark-card", "group"];
  if (isMasonry) cardClasses.push("bookmark-card--masonry");

  const mediaWrapperClasses = ["relative", "overflow-hidden"];
  if (!isMasonry) mediaWrapperClasses.push("aspect-[4/5]");

  return (
    <div onClick={onClick} className={cardClasses.join(" ")}>
      <div className={isMasonry ? "bookmark-card-content bookmark-card-content--masonry" : "bookmark-card-content"}>
        {/* Image / skeleton / brand fallback */}
        <div className={mediaWrapperClasses.join(" ")}>
          {showSkeleton && (
            <div className={["w-full", isMasonry ? "min-h-[160px]" : "h-full", "animate-pulse", "bg-white/5"].join(" ")} />
          )}
          {!showSkeleton && image && (
            <img
              src={image}
              alt=""
              className={isMasonry ? "w-full h-auto" : "h-full w-full object-cover"}
            />
          )}
          {!showSkeleton && showBrand && (
            <div
              className={[
                "w-full flex items-center justify-center bg-white/5 text-text-secondary",
                isMasonry ? "bookmark-card-placeholder" : "h-full"
              ].join(" ")}
            >
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
    </div>
  );
}
