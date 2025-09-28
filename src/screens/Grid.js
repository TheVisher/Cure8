import React from "react";
import { AppShell } from "../components/AppShell.js";
import { Sidebar } from "../components/Sidebar.js";
import { Card } from "../components/Card.js";
import SettingsScreen from "./Settings.js";
import HomeScreen from "./Home.js";

const STORAGE_KEY = "cure8.bookmarks";
const SETTINGS_KEY = "cure8.settings";

const defaultSettings = {
  autoFetchMetadata: true,
  showThumbnails: true,
  previewServiceUrl: "http://localhost:8787/preview?url={{url}}"
};

const CATEGORY_IDS = new Set(["Home", "All", "Work", "Personal", "Favorites", "Recent"]);
const LAYOUT_KEY = "cure8.layout";

const randomId = () => {
  try {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {}
  return `id_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
};

const readSettingsFromStorage = () => {
  if (typeof window === "undefined") return { ...defaultSettings };
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return { ...defaultSettings, ...parsed };
    }
    return { ...defaultSettings };
  } catch {
    return { ...defaultSettings };
  }
};

const buildPreviewRequestUrl = (template, targetUrl) => {
  const safeTemplate = (template || "").trim();
  const fallback = defaultSettings.previewServiceUrl;
  const base = safeTemplate || fallback;
  const encoded = encodeURIComponent(targetUrl);
  if (base.includes("{{url}}")) {
    return base.replace(/\{\{url\}\}/g, encoded);
  }
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}url=${encoded}`;
};

export default function GridScreen() {
  const [activeView, setActiveView] = React.useState("Home");
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [settings, setSettings] = React.useState(readSettingsFromStorage);
  const [layoutMode, setLayoutMode] = React.useState(() => {
    if (typeof window === "undefined") return "grid";
    const stored = window.localStorage.getItem(LAYOUT_KEY);
    return stored === "masonry" ? "masonry" : "grid";
  });

  const persistItems = React.useCallback((updater) => {
    setItems(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (err) {
          console.error("Failed to persist bookmarks", err);
        }
      }
      return next;
    });
  }, []);

  const updateSettings = React.useCallback((partial) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = React.useCallback(() => {
    setSettings(() => ({ ...defaultSettings }));
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error("Failed to persist settings", err);
    }
  }, [settings]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to persist bookmarks", err);
    }
  }, [items]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LAYOUT_KEY, layoutMode);
    } catch (err) {
      console.error("Failed to persist layout mode", err);
    }
  }, [layoutMode]);

  // Listen to omnibox events
  React.useEffect(() => {
    const onSearch = (e) => setQ(e.detail.q || "");
    const onAdd = async (e) => {
      const url = e.detail.url;
      const id = randomId();
      let domain = url;
      try {
        domain = new URL(url).hostname.replace(/^www\./, "");
      } catch {}

      persistItems(x => [{
        id,
        title: url,
        domain,
        url,
        state: settings.autoFetchMetadata ? "pending" : "ok"
      }, ...x]);

      if (!settings.autoFetchMetadata) {
        return;
      }

      try {
        const requestUrl = buildPreviewRequestUrl(settings.previewServiceUrl, url);
        const res = await fetch(requestUrl);
        if (!res.ok) {
          throw new Error(`Preview service responded with ${res.status}`);
        }
        const meta = await res.json();
        persistItems(x => x.map(it => it.id === id ? {
          ...it,
          title: meta.title || it.title,
          domain: meta.domain || it.domain,
          image: meta.cardImage || meta.heroImage || null,
          url: meta.url || it.url || url,
          state: "ok"
        } : it));
      } catch (error) {
        console.error("Preview lookup failed", error);
        persistItems(x => x.map(it => it.id === id ? { ...it, state: "error" } : it));
      }
    };
    window.addEventListener("cure8.search", onSearch);
    window.addEventListener("cure8.add-url", onAdd);
    return () => {
      window.removeEventListener("cure8.search", onSearch);
      window.removeEventListener("cure8.add-url", onAdd);
    };
  }, [persistItems, settings]);

  React.useEffect(() => {
    if (activeView !== "settings" && activeView !== "help") return;
    setShowDetailsModal(false);
  }, [activeView]);

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleDeleteItem = (itemId) => {
    const item = items.find(it => it.id === itemId);
    if (item && window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      persistItems(prev => prev.filter(it => it.id !== itemId));
      setShowDetailsModal(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cure8-bookmarks-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const importedItems = JSON.parse(evt.target.result);
          if (Array.isArray(importedItems)) {
            persistItems(prev => {
              const normalized = importedItems.map(item => {
                let domain = item.domain || "";
                if (!domain && item.url) {
                  try {
                    domain = new URL(item.url).hostname.replace(/^www\./, "");
                  } catch {}
                }
                return {
                  id: item.id || randomId(),
                  title: item.title || item.url || "Untitled",
                  domain,
                  url: item.url || null,
                  image: item.image || null,
                  state: item.state || "ok"
                };
              });
              return [...normalized, ...prev];
            });
            alert(`Successfully imported ${importedItems.length} bookmarks!`);
          } else {
            alert("Invalid file format. Please select a valid Cure8 export file.");
          }
        } catch (error) {
          alert("Error reading file. Please make sure it's a valid JSON file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearData = () => {
    if (window.confirm("Clear all saved bookmarks? This cannot be undone.")) {
      persistItems([]);
    }
  };

  const focusOmnibox = React.useCallback(() => {
    if (typeof document === "undefined") return;
    const input = document.querySelector('input[placeholder="Paste a URL to add, or type to search…"]');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const categoryId = CATEGORY_IDS.has(activeView) ? activeView : "All";

  const filtered = items.filter(it => {
    const t = (it.title || "").toLowerCase();
    const d = (it.domain || "").toLowerCase();
    const s = q.toLowerCase();
    const matchesSearch = !s || t.includes(s) || d.includes(s);
    if (!matchesSearch) return false;
    if (categoryId === "All" || categoryId === "Home") return true;
    return (it.category || "").toLowerCase() === categoryId.toLowerCase();
  });

  let content;
  if (activeView === "settings") {
    content = (
      <SettingsScreen
        settings={settings}
        defaultSettings={defaultSettings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
        onExport={handleExport}
        onImport={handleImport}
        onClearData={handleClearData}
        itemCount={items.length}
      />
    );
  } else if (activeView === "Home") {
    const pendingCount = items.filter(it => it.state === "pending").length;
    const errorCount = items.filter(it => it.state === "error").length;
    const okCount = items.length - pendingCount - errorCount;
    const recentItems = items.slice(0, 6);

    content = (
      <HomeScreen
        totalItems={items.length}
        readyItems={okCount}
        pendingItems={pendingCount}
        errorItems={errorCount}
        recentItems={recentItems}
        onQuickAdd={focusOmnibox}
        onImport={handleImport}
        onOpenSettings={() => setActiveView("settings")}
        onGoToLibrary={() => setActiveView("All")}
        onSelectBookmark={handleCardClick}
        showThumbnails={settings.showThumbnails}
      />
    );
  } else if (activeView === "help") {
    content = (
      <div className="bg-surface border border-white/10 rounded-card p-6 text-text-secondary">
        <h2 className="text-xl font-bold text-text-primary mb-3">Help</h2>
        <p className="text-sm">
          We're working on curated tips and documentation. For now, reach out to support@cure8s.com
          if you need a hand.
        </p>
      </div>
    );
  } else {
    content = (
      <>
        <div className="layout-toolbar">
          <span className="layout-label">Layout</span>
          <div className="layout-toggle">
            {[
              { id: "grid", label: "Grid" },
              { id: "masonry", label: "Masonry" }
            ].map(option => (
              <button
                key={option.id}
                type="button"
                className={[
                  "layout-toggle-btn",
                  layoutMode === option.id ? "is-active" : ""
                ].join(" ")}
                onClick={() => setLayoutMode(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={["bookmark-grid", layoutMode === "masonry" ? "masonry" : ""].filter(Boolean).join(" ")}>
          {filtered.map(it => (
            <Card
              key={it.id}
              title={it.title}
              domain={it.domain}
              image={settings.showThumbnails ? it.image : undefined}
              state={it.state}
              onClick={() => handleCardClick(it)}
              layout={layoutMode}
            />
          ))}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedItem && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDetailsModal(false)}
          >
            <div
              className="bg-surface rounded-card p-6 max-w-md w-full mx-4 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-text-primary">Bookmark Details</h2>
                <button
                  className="text-text-muted hover:text-text-primary text-2xl"
                  onClick={() => setShowDetailsModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">Title</label>
                  <p className="text-text-primary">{selectedItem.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">URL</label>
                  <p className="text-text-primary break-all">{selectedItem.url || "N/A"}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-1">Domain</label>
                  <p className="text-text-primary">{selectedItem.domain}</p>
                </div>

                {selectedItem.image && (
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-1">Thumbnail</label>
                    <img src={selectedItem.image} alt="Thumbnail" className="w-full h-32 object-cover rounded" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 bg-accent-purple text-white px-4 py-2 rounded-pill hover:brightness-110 transition"
                  onClick={() => {
                    if (selectedItem.url) {
                      window.open(selectedItem.url, "_blank");
                    }
                  }}
                >
                  Open Link
                </button>
                <button
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-pill hover:brightness-110 transition"
                  onClick={() => handleDeleteItem(selectedItem.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <AppShell
      sidebar={
        <Sidebar
          active={activeView}
          onChange={setActiveView}
          onExport={handleExport}
          onImport={handleImport}
        />
      }
    >
      {content}
    </AppShell>
  );
}
