import React from "react";

export function AppShell({ sidebar, children }) {
  return (
    <div className="fixed inset-0 text-text-primary bg-surface overflow-hidden">
      {/* Sidebar Content */}
      <aside className="absolute left-0 top-0 w-64 h-full z-10">
        <div className="h-full flex flex-col p-4">
          <div className="font-bold text-xl text-accent-purple mb-6">Cure8</div>
          {sidebar}
        </div>
      </aside>

      {/* Top Bar Content */}
      <header className="absolute left-64 top-0 right-3 h-16 px-6 py-4 z-20">
        <div className="flex items-center justify-center h-full">
          {/* Centered Omnibox */}
          <div className="w-full max-w-2xl">
            <OmniBox />
          </div>
        </div>
      </header>

      {/* Right Padding */}
      <div className="absolute right-0 top-0 w-3 h-full z-20 bg-surface"></div>

      {/* Bottom Padding */}
      <div className="absolute left-0 bottom-0 right-0 h-3 z-20 bg-surface"></div>

      {/* Main Content Area with inset background */}
      <main className="absolute left-64 top-16 right-3 bottom-3 p-2 z-10">
        {/* Inset background for the content area */}
        <div className="absolute inset-0 bg-background rounded-xl">
          {/* Scrollable content area */}
          <div className="h-full overflow-y-auto p-6">
            {children}
          </div>
        </div>
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
