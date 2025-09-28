import React from "react";

export function AppShell({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-text-primary bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xs border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="font-bold text-xl text-accent-purple">Cure8</div>

          {/* Centered Omnibox */}
          <div className="flex-1 max-w-2xl mx-4">
            <OmniBox />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-sm">Username</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-[240px_1fr] gap-6">
        <aside>{sidebar}</aside>
        <section>{children}</section>
      </main>
    </div>
  );
}

/** Omnibox: paste a URL to add, or type to search */
function OmniBox() {
  const [q, setQ] = React.useState("");

  const isUrl = React.useMemo(() => {
    try { const u = new URL(q.trim()); return /^https?:/.test(u.protocol); } catch { return /^https?:\/\//i.test(q.trim()); }
  }, [q]);

  // Debounced search
  React.useEffect(() => {
    if (!isUrl && q.trim()) {
      const t = setTimeout(() => window.dispatchEvent(new CustomEvent("cure8.search", { detail: { q } })), 200);
      return () => clearTimeout(t);
    }
  }, [q, isUrl]);

  const submit = () => {
    if (isUrl) {
      window.dispatchEvent(new CustomEvent("cure8.add-url", { detail: { url: q.trim() } }));
      setQ("");
    } else {
      window.dispatchEvent(new CustomEvent("cure8.search", { detail: { q } }));
    }
  };

  return (
    <div className="relative">
      <input
        className="w-full rounded-[0.8rem] bg-background/90 border border-accent-purple/60 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/40 px-4 py-2 text-sm placeholder:text-text-muted"
        placeholder="Paste a URL to add, or type to search…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setQ(""); }}
      />
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
        {isUrl ? "Add link ↵" : "Search ↵"}
      </div>
    </div>
  );
}
