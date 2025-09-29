import React from "react";

export function AppShell({ sidebar, children }) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-inner">
          <div className="app-logo">Cure8</div>
          {sidebar}
        </div>
      </aside>

      <header className="app-header">
        <div className="app-header-inner">
          <div className="omni-shadow app-header-search">
            <OmniBox />
          </div>
          <span className="app-header-badge">Local Mode</span>
        </div>
      </header>

      <main className="app-main">
        <div className="app-main-surface">
          <div className="app-main-scroll">{children}</div>
        </div>
      </main>
    </div>
  );
}

function OmniBox() {
  const [q, setQ] = React.useState("");

  const isUrl = React.useMemo(() => {
    try {
      const u = new URL(q.trim());
      return /^https?:/.test(u.protocol);
    } catch {
      return /^https?:\/\//i.test(q.trim());
    }
  }, [q]);

  React.useEffect(() => {
    if (!isUrl) {
      const t = setTimeout(
        () => window.dispatchEvent(new CustomEvent("cure8.search", { detail: { q } })),
        200
      );
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
    <div className="omni-root">
      <div className="omni-container">
        <input
          className="omni-input"
          placeholder="Paste a URL to add, or type to search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setQ("");
          }}
        />
        <div className="omni-hint">{isUrl ? "Add link ↵" : "Search ↵"}</div>
      </div>
      <div className="omni-glow" aria-hidden="true" />
    </div>
  );
}
