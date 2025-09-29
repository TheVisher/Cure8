import React from "react";
import { AppShell } from "../components/AppShell.js";
import { Sidebar } from "../components/Sidebar.js";
import { Card } from "../components/Card.js";
import SettingsScreen from "./Settings.js";
import HomeScreen from "./Home.js";

const STORAGE_KEY = "cure8.bookmarks";
const SETTINGS_KEY = "cure8.settings";

function safeHost(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function BookmarkModal({ item, onClose, onDelete }) {
  const displayTitle = item.title?.trim() || item.url || item.domain || "Untitled";
  const displayDomain = item.domain || safeHost(item.url);
  const savedAt = item.createdAt ? new Date(item.createdAt) : null;
  const [draftNotes, setDraftNotes] = React.useState(item.notes || "");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setDraftNotes(item.notes || "");
  }, [item.id, item.notes]);

  React.useEffect(() => {
    const listener = (e) => {
      if (e.detail?.id === item.id && typeof e.detail.patch?.notes === "string") {
        setDraftNotes(e.detail.patch.notes);
      }
    };
    window.addEventListener("cure8.note", listener);
    return () => window.removeEventListener("cure8.note", listener);
  }, [item.id]);

  const commitNotes = React.useCallback((notes) => {
    window.dispatchEvent(new CustomEvent("cure8.update", {
      detail: {
        id: item.id,
        patch: { notes }
      }
    }));
  }, [item.id]);

  const handleSave = () => {
    const trimmed = draftNotes.trim();
    if ((item.notes || "") === trimmed) return;
    setIsSaving(true);
    setDraftNotes(trimmed);
    commitNotes(trimmed);
    setTimeout(() => setIsSaving(false), 200);
  };

  const dirty = (item.notes || "") !== draftNotes.trim();

  return (
    <div className="bookmark-modal-backdrop" onClick={onClose}>
      <div className="bookmark-modal" onClick={(e) => e.stopPropagation()}>
        <button className="bookmark-modal-close" onClick={onClose} aria-label="Close details">
          ×
        </button>

        <div className="bookmark-modal-media">
          {item.image ? (
            <img src={item.image} alt="Preview" />
          ) : (
            <div className="bookmark-modal-media-placeholder">{displayDomain || 'link'}</div>
          )}
        </div>

        <aside className="bookmark-modal-meta">
          <header className="bookmark-modal-header">
            <h2>{displayTitle}</h2>
            {displayDomain && <span className="bookmark-modal-domain">{displayDomain}</span>}
          </header>

          {item.url && (
            <div className="bookmark-modal-row">
              <span className="bookmark-modal-label">URL</span>
              <a className="bookmark-modal-url" href={item.url} target="_blank" rel="noreferrer">
                {item.url}
              </a>
            </div>
          )}

          {savedAt && (
            <div className="bookmark-modal-row">
              <span className="bookmark-modal-label">Saved</span>
              <span className="bookmark-modal-value">{savedAt.toLocaleString()}</span>
            </div>
          )}

          <div className="bookmark-modal-summary">
            <span className="bookmark-modal-label">Summary</span>
            <p>
              {item.description?.trim() ||
                "We're working on AI-powered annotations. For now, use notes below to capture a TL;DR."}
            </p>
          </div>

          <div className="bookmark-modal-notes">
            <span className="bookmark-modal-label">Notes</span>
            <textarea
              placeholder="Capture quick thoughts…"
              rows={5}
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
            />
            <div className="bookmark-modal-note-actions">
              <div className="bookmark-modal-note-status">
                {isSaving ? "Saving…" : dirty ? "Unsaved changes" : "Saved"}
              </div>
              <button
                type="button"
                className="bookmark-modal-note-save"
                disabled={!dirty || isSaving}
                onClick={handleSave}
              >
                Save Notes
              </button>
            </div>
          </div>

          <div className="bookmark-modal-actions">
            <button
              className="bookmark-modal-action"
              onClick={() => {
                if (item.url) {
                  window.open(item.url, '_blank');
                }
              }}
            >
              Open Link
            </button>
            <button className="bookmark-modal-delete" onClick={onDelete}>
              Delete
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const defaultSettings = {
  autoFetchMetadata: true,
  showThumbnails: true,
  previewServiceUrl: "http://localhost:8787/preview?url={{url}}"
};

const CATEGORY_IDS = new Set(["Home", "All", "Work", "Personal", "Favorites", "Recent"]);
const LAYOUT_KEY = "cure8.layout";
const LAYOUT_OPTIONS = [
  { id: "grid", label: "Grid" },
  { id: "masonry", label: "Masonry" },
  { id: "list", label: "List" },
  { id: "compact", label: "Compact" }
];

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
      return Array.isArray(parsed)
        ? parsed.map(it => ({
            ...it,
            description: it.description || '',
            notes: it.notes || '',
            state: it.state || 'ok',
            createdAt: it.createdAt || Date.now()
          }))
        : [];
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
    return LAYOUT_OPTIONS.some(option => option.id === stored) ? stored : "grid";
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
    const onUpdate = (event) => {
      const detail = event.detail;
      if (!detail || !detail.id || !detail.patch) return;
      persistItems(prev => prev.map(it => it.id === detail.id ? { ...it, ...detail.patch } : it));
      window.dispatchEvent(new CustomEvent("cure8.note", { detail }));
    };
    window.addEventListener("cure8.update", onUpdate);
    return () => window.removeEventListener("cure8.update", onUpdate);
  }, [persistItems]);

  React.useEffect(() => {
    if (!selectedItem) return;
    const fresh = items.find(it => it.id === selectedItem.id);
    if (fresh && fresh !== selectedItem) {
      setSelectedItem(fresh);
    }
  }, [items, selectedItem]);

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
        description: '',
        notes: '',
        state: settings.autoFetchMetadata ? "pending" : "ok",
        createdAt: Date.now()
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
          description: meta.description || it.description || '',
          notes: it.notes || '',
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
                  description: item.description || '',
                  notes: item.notes || '',
                  state: item.state || "ok",
                  createdAt: item.createdAt || Date.now()
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
            {LAYOUT_OPTIONS.map(option => (
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

        {layoutMode === "list" ? (
          <div className="bookmark-list">
            {filtered.map(it => (
              <Card
                key={it.id}
                title={it.title}
                domain={it.domain}
                image={settings.showThumbnails ? it.image : undefined}
                state={it.state}
                onClick={() => handleCardClick(it)}
                layout={layoutMode}
                url={it.url}
              />
            ))}
          </div>
        ) : (
          <div className={["bookmark-grid", layoutMode === "masonry" ? "masonry" : "", layoutMode === "compact" ? "compact" : ""].filter(Boolean).join(" ")}>
            {filtered.map(it => (
              <Card
                key={it.id}
                title={it.title}
                domain={it.domain}
                image={settings.showThumbnails ? it.image : undefined}
                state={it.state}
                onClick={() => handleCardClick(it)}
                layout={layoutMode}
                url={it.url}
              />
            ))}
          </div>
        )}

        {showDetailsModal && selectedItem && (
          <BookmarkModal
            item={selectedItem}
            onClose={() => setShowDetailsModal(false)}
            onDelete={() => handleDeleteItem(selectedItem.id)}
          />
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
