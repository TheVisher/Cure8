import React from "react";

export default function SettingsScreen({
  settings,
  defaultSettings,
  onUpdateSettings,
  onResetSettings,
  onExport,
  onImport,
  onClearData,
  itemCount
}) {
  const [previewEndpoint, setPreviewEndpoint] = React.useState(
    settings.previewServiceUrl || defaultSettings.previewServiceUrl
  );

  React.useEffect(() => {
    setPreviewEndpoint(settings.previewServiceUrl || defaultSettings.previewServiceUrl);
  }, [settings.previewServiceUrl, defaultSettings.previewServiceUrl]);

  const applyPreviewEndpoint = () => {
    const trimmed = previewEndpoint.trim();
    onUpdateSettings({ previewServiceUrl: trimmed || defaultSettings.previewServiceUrl });
  };

  const handlePreviewKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyPreviewEndpoint();
      event.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-surface border border-white/10 rounded-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Preferences</h2>
            <p className="text-sm text-text-muted mt-1">
              Tailor Cure8 to match how you gather and review links.
            </p>
          </div>
          <button
            className="text-sm text-accent-purple hover:underline"
            onClick={onResetSettings}
            type="button"
          >
            Reset to defaults
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <SettingsToggle
            label="Auto-fetch metadata"
            description="Enrich newly added URLs with titles, domains, and preview art using the link preview service."
            checked={settings.autoFetchMetadata}
            onChange={(value) => onUpdateSettings({ autoFetchMetadata: value })}
          />

          <SettingsToggle
            label="Show thumbnails"
            description="Display preview images on cards when a thumbnail is available. Turn off for a text-first layout."
            checked={settings.showThumbnails}
            onChange={(value) => onUpdateSettings({ showThumbnails: value })}
          />
        </div>
      </section>

      <section className="bg-surface border border-white/10 rounded-card p-6">
        <h2 className="text-xl font-bold text-text-primary">Link Preview Service</h2>
        <p className="text-sm text-text-muted mt-1">
          Point Cure8 at your metadata service. Use <code className="bg-white/10 px-1.5 py-0.5 rounded">{"{url}"}</code>
          as a placeholder for the collected URL.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold text-text-secondary" htmlFor="preview-endpoint">
            Endpoint template
          </label>
          <input
            id="preview-endpoint"
            type="text"
            value={previewEndpoint}
            onChange={(event) => setPreviewEndpoint(event.target.value)}
            onBlur={applyPreviewEndpoint}
            onKeyDown={handlePreviewKeyDown}
            className="w-full rounded-xl border border-white/10 bg-background/80 px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/40"
            placeholder="https://your-service.dev/preview?url={{url}}"
          />
          <p className="text-xs text-text-muted">
            Example: <span className="text-text-secondary">{"http://localhost:8787/preview?url={{url}}"}</span>
          </p>
        </div>
      </section>

      <section className="bg-surface border border-white/10 rounded-card p-6">
        <h2 className="text-xl font-bold text-text-primary">Library</h2>
        <p className="text-sm text-text-muted mt-1">
          You currently have <span className="text-text-secondary font-semibold">{itemCount}</span> saved bookmark{itemCount === 1 ? "" : "s"}.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onExport}
            className="rounded-pill bg-accent-purple px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
          >
            Export bookmarks
          </button>
          <button
            type="button"
            onClick={onImport}
            className="rounded-pill border border-white/15 px-4 py-2 text-sm font-semibold text-text-primary hover:border-accent-purple/60 transition"
          >
            Import bookmarks
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <h3 className="text-sm font-semibold text-red-200">Danger zone</h3>
          <p className="text-xs text-red-200/80 mt-1">
            Permanently delete every saved bookmark from this device.
          </p>
          <button
            type="button"
            onClick={onClearData}
            className="mt-3 rounded-pill bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition"
          >
            Clear all bookmarks
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingsToggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-accent-purple/40">
      <span>
        <span className="block text-sm font-semibold text-text-primary">{label}</span>
        {description && (
          <span className="mt-1 block text-xs text-text-muted">{description}</span>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5"
        style={{ accentColor: "#7C3AED" }}
      />
    </label>
  );
}
