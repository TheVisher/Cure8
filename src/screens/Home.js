import React from "react";
import { Card } from "../components/Card.js";

export default function HomeScreen({
  totalItems,
  readyItems,
  pendingItems,
  errorItems,
  recentItems,
  onQuickAdd,
  onImport,
  onOpenSettings,
  onGoToLibrary,
  onSelectBookmark,
  showThumbnails
}) {
  const hasBookmarks = totalItems > 0;

  return (
    <div className="space-y-8">
      <section className="home-hero">
        <div>
          <p className="home-eyebrow">Welcome back to Cure8</p>
          <h1 className="home-title">Curate what matters most today.</h1>
          <p className="home-subtitle">
            Save fresh inspiration, surface trusted resources, and keep your health knowledge within reach.
          </p>
          <div className="home-actions">
            <button type="button" className="home-action primary" onClick={onQuickAdd}>
              Paste a link
            </button>
            <button type="button" className="home-action" onClick={onImport}>
              Import bookmarks
            </button>
            <button type="button" className="home-action subtle" onClick={onOpenSettings}>
              Settings
            </button>
          </div>
        </div>
        <div className="home-hero-card">
          <span className="home-hero-label">At a glance</span>
          <div className="home-hero-metric">
            <strong>{totalItems}</strong>
            <span>items saved</span>
          </div>
          <p>
            {readyItems} ready · {pendingItems} fetching · {errorItems} need attention
          </p>
          <button type="button" onClick={onGoToLibrary} className="home-hero-link">
            Open library ↗
          </button>
        </div>
      </section>

      <section>
        <h2 className="home-section-title">Your library snapshot</h2>
        <div className="home-stats-grid">
          <StatCard label="Ready to browse" value={readyItems} tone="success" />
          <StatCard label="Fetching previews" value={pendingItems} tone="neutral" />
          <StatCard label="Needs review" value={errorItems} tone="alert" />
        </div>
      </section>

      {hasBookmarks ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="home-section-title">Latest captures</h2>
            <button type="button" className="home-ghost-link" onClick={onGoToLibrary}>
              View all ↗
            </button>
          </div>
          <div className="home-recent-grid">
            {recentItems.map(item => (
              <Card
                key={item.id}
                title={item.title}
                domain={item.domain}
                image={showThumbnails ? item.image : undefined}
                state={item.state}
                onClick={() => onSelectBookmark(item)}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="home-empty">
          <div className="home-empty-card">
            <h3>No bookmarks yet</h3>
            <p>Paste a URL or import an export file to start building your curated health library.</p>
            <div className="home-empty-actions">
              <button type="button" className="home-action primary" onClick={onQuickAdd}>
                Add your first link
              </button>
              <button type="button" className="home-action" onClick={onImport}>
                Import from file
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ value, label, tone = "neutral" }) {
  return (
    <div className={`home-stat-card tone-${tone}`}>
      <span className="home-stat-value">{value}</span>
      <span className="home-stat-label">{label}</span>
    </div>
  );
}
