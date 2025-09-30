"use client";

import React from "react";
import { AppShell } from "./AppShell";
import { Sidebar } from "./Sidebar";
import { Card } from "./Card";
import SettingsScreen from "./Settings";
import HomeScreen from "./Home";

function safeHost(url: string | null | undefined) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

interface Tag {
  id: string;
  name: string;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  domain: string | null;
  image: string | null;
  description: string | null;
  notes: string | null;
  state: string;
  createdAt: Date | string | number;
  updatedAt: Date | string | number;
  tags: Tag[];
}

interface BookmarkModalProps {
  item: Bookmark;
  onClose: () => void;
  onDelete: () => void;
}

function BookmarkModal({ item, onClose, onDelete }: BookmarkModalProps) {
  const displayTitle = item.title?.trim() || item.url || item.domain || "Untitled";
  const displayDomain = item.domain || safeHost(item.url);
  const savedAt = item.createdAt ? new Date(item.createdAt) : null;
  const [draftNotes, setDraftNotes] = React.useState(item.notes || "");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setDraftNotes(item.notes || "");
  }, [item.id, item.notes]);

  React.useEffect(() => {
    const listener = (e: any) => {
      if (e.detail?.id === item.id && typeof e.detail.patch?.notes === "string") {
        setDraftNotes(e.detail.patch.notes);
      }
    };
    window.addEventListener("cure8.note", listener);
    return () => window.removeEventListener("cure8.note", listener);
  }, [item.id]);

  const commitNotes = React.useCallback((notes: string) => {
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
  previewServiceUrl: "http://localhost:8787/preview?url={{url}}",
  layoutMode: "grid"
};

const CATEGORY_IDS = new Set(["Home", "All", "Work", "Personal", "Favorites", "Recent"]);
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

const buildPreviewRequestUrl = (template: string, targetUrl: string) => {
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
  const [items, setItems] = React.useState<Bookmark[]>([]);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Bookmark | null>(null);
  const [settings, setSettings] = React.useState(defaultSettings);
  const [layoutMode, setLayoutMode] = React.useState("grid");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load initial data from API
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Load bookmarks
        const bookmarksRes = await fetch('/api/bookmarks');
        if (bookmarksRes.ok) {
          const bookmarks = await bookmarksRes.json();
          setItems(bookmarks);
        } else {
          console.error('Failed to load bookmarks:', bookmarksRes.status);
        }

        // Load settings
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings({ ...defaultSettings, ...settingsData });
          if (settingsData.layoutMode) {
            setLayoutMode(settingsData.layoutMode);
          }
        } else {
          console.error('Failed to load settings:', settingsRes.status);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadInitialData();
  }, []);

  // Persist layout mode changes to API
  React.useEffect(() => {
    if (!isInitialized) return;

    const persistLayoutMode = async () => {
      try {
        await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ layoutMode })
        });
      } catch (error) {
        console.error('Failed to persist layout mode:', error);
      }
    };

    persistLayoutMode();
  }, [layoutMode, isInitialized]);

  // Update settings in API
  const updateSettings = React.useCallback(async (partial: Partial<typeof settings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial)
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }, [settings]);

  const resetSettings = React.useCallback(async () => {
    setSettings({ ...defaultSettings });

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultSettings)
      });
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }, []);

  // Listen to cure8.update events and sync to API
  React.useEffect(() => {
    const onUpdate = async (event: any) => {
      const detail = event.detail;
      if (!detail || !detail.id || !detail.patch) return;

      // Optimistically update local state
      setItems(prev => prev.map(it =>
        it.id === detail.id ? { ...it, ...detail.patch } : it
      ));

      // Sync to API
      try {
        await fetch(`/api/bookmarks/${detail.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(detail.patch)
        });
      } catch (error) {
        console.error('Failed to update bookmark:', error);
      }

      window.dispatchEvent(new CustomEvent("cure8.note", { detail }));
    };
    window.addEventListener("cure8.update", onUpdate);
    return () => window.removeEventListener("cure8.update", onUpdate);
  }, []);

  // Sync selected item with items array
  React.useEffect(() => {
    if (!selectedItem) return;
    const fresh = items.find(it => it.id === selectedItem.id);
    if (fresh && fresh !== selectedItem) {
      setSelectedItem(fresh);
    }
  }, [items, selectedItem]);

  // Listen to omnibox events
  React.useEffect(() => {
    const onSearch = (e: any) => setQ(e.detail.q || "");

    const onAdd = async (e: any) => {
      const url = e.detail.url;
      const id = randomId();
      let domain = url;
      try {
        domain = new URL(url).hostname.replace(/^www\./, "");
      } catch {}

      // Optimistically add to UI
      const newBookmark: Bookmark = {
        id,
        title: url,
        domain,
        url,
        description: '',
        notes: '',
        state: settings.autoFetchMetadata ? "pending" : "ok",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: []
      };

      setItems(x => [newBookmark, ...x]);

      if (!settings.autoFetchMetadata) {
        // Save to API
        try {
          await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              title: url,
              domain,
              url,
              description: '',
              notes: '',
              state: 'ok'
            })
          });
        } catch (error) {
          console.error('Failed to save bookmark:', error);
        }
        return;
      }

      // Fetch metadata
      try {
        const requestUrl = buildPreviewRequestUrl(settings.previewServiceUrl, url);
        const res = await fetch(requestUrl);
        if (!res.ok) {
          throw new Error(`Preview service responded with ${res.status}`);
        }
        const meta = await res.json();

        const updatedBookmark = {
          id,
          title: meta.title || url,
          domain: meta.domain || domain,
          url: meta.url || url,
          image: meta.cardImage || meta.heroImage || null,
          description: meta.description || '',
          notes: '',
          state: "ok"
        };

        // Update local state
        setItems(x => x.map(it => it.id === id ? { ...it, ...updatedBookmark } : it));

        // Save to API
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBookmark)
        });
      } catch (error) {
        console.error("Preview lookup failed", error);

        // Update state to error
        setItems(x => x.map(it => it.id === id ? { ...it, state: "error" } : it));

        // Save to API with error state
        try {
          await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              title: url,
              domain,
              url,
              description: '',
              notes: '',
              state: 'error'
            })
          });
        } catch (err) {
          console.error('Failed to save bookmark with error state:', err);
        }
      }
    };

    window.addEventListener("cure8.search", onSearch);
    window.addEventListener("cure8.add-url", onAdd);
    return () => {
      window.removeEventListener("cure8.search", onSearch);
      window.removeEventListener("cure8.add-url", onAdd);
    };
  }, [settings]);

  React.useEffect(() => {
    if (activeView !== "settings" && activeView !== "help") return;
    setShowDetailsModal(false);
  }, [activeView]);

  const handleCardClick = (item: Bookmark) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = items.find(it => it.id === itemId);
    if (item && window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      // Optimistically remove from UI
      setItems(prev => prev.filter(it => it.id !== itemId));
      setShowDetailsModal(false);

      // Delete from API
      try {
        await fetch(`/api/bookmarks/${itemId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Failed to delete bookmark:', error);
        // Reload data to sync state
        const bookmarksRes = await fetch('/api/bookmarks');
        if (bookmarksRes.ok) {
          const bookmarks = await bookmarksRes.json();
          setItems(bookmarks);
        }
      }
    }
  };

  const handleExport = async () => {
    try {
      // Fetch fresh data from API
      const res = await fetch('/api/bookmarks');
      if (!res.ok) {
        throw new Error('Failed to fetch bookmarks');
      }
      const bookmarks = await res.json();

      const dataStr = JSON.stringify(bookmarks, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cure8-bookmarks-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export bookmarks:', error);
      alert('Failed to export bookmarks. Please try again.');
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt: any) => {
        try {
          const importedItems = JSON.parse(evt.target.result);
          if (!Array.isArray(importedItems)) {
            alert("Invalid file format. Please select a valid Cure8 export file.");
            return;
          }

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

          // Optimistically add to UI
          setItems(prev => [...normalized, ...prev]);

          // Save to API (batch import)
          try {
            for (const bookmark of normalized) {
              await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookmark)
              });
            }
            alert(`Successfully imported ${importedItems.length} bookmarks!`);
          } catch (error) {
            console.error('Failed to import bookmarks:', error);
            alert('Some bookmarks failed to import. Please check the console for details.');
          }
        } catch (error) {
          alert("Error reading file. Please make sure it's a valid JSON file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearData = async () => {
    if (window.confirm("Clear all saved bookmarks? This cannot be undone.")) {
      try {
        // Delete all bookmarks via API
        const deletePromises = items.map(item =>
          fetch(`/api/bookmarks/${item.id}`, { method: 'DELETE' })
        );
        await Promise.all(deletePromises);

        // Clear local state
        setItems([]);
      } catch (error) {
        console.error('Failed to clear bookmarks:', error);
        alert('Failed to clear all bookmarks. Please try again.');
      }
    }
  };

  const focusOmnibox = React.useCallback(() => {
    if (typeof document === "undefined") return;
    const input = document.querySelector('input[placeholder="Paste a URL to add, or type to search…"]') as HTMLInputElement;
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const sortedByRecency = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const aTime = typeof a.createdAt === "number" ? a.createdAt :
                    typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() :
                    a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bTime = typeof b.createdAt === "number" ? b.createdAt :
                    typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() :
                    b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    });
  }, [items]);

  const categoryId = CATEGORY_IDS.has(activeView) ? activeView : "All";

  const filtered = React.useMemo(() => {
    const search = q.toLowerCase();
    const matchesSearch = (item: Bookmark) => {
      const title = (item.title || "").toLowerCase();
      const domain = (item.domain || "").toLowerCase();
      return !search || title.includes(search) || domain.includes(search);
    };

    if (categoryId === "Recent") {
      return sortedByRecency
        .filter(matchesSearch)
        .filter(it => it.createdAt)
        .slice(0, 50);
    }

    const baseMatches = sortedByRecency.filter(matchesSearch);
    if (categoryId === "All" || categoryId === "Home" || !categoryId) {
      return baseMatches;
    }

    const targetCategory = categoryId.toLowerCase();
    return baseMatches.filter(it => {
      // Category functionality not yet implemented in schema, so return all for now
      return true;
    });
  }, [sortedByRecency, q, categoryId]);

  if (isLoading) {
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
        <div className="flex items-center justify-center min-h-screen text-text-secondary">
          Loading...
        </div>
      </AppShell>
    );
  }

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
    const recentItems = sortedByRecency.slice(0, 6);

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

        {categoryId === "Recent" && filtered.length === 0 && (
          <div className="mt-6 text-sm text-text-secondary">
            No recent items yet - save something!
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